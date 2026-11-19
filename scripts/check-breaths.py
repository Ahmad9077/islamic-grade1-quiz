"""Find sighs and long breaths inside narration clips.

A breath is quiet but not silent: inside the clip (not at its trimmed edges), a stretch of at
least 0.28 s whose level stays between -54 and -30 dBFS, with at least 0.12 s of it between
-50 and -38 dBFS (calibrated on the English quiz's sighing clips of 2026-11-08). Shorter flags
at ح ف خ ث are consonants. Usage: python3 scripts/check-breaths.py public/audio [prefix]
"""
import math, os, struct, subprocess, sys

RATE = 16000
FRAME = 320  # 20 ms
LOW, HIGH = -54.0, -30.0
CORE_LOW, CORE_HIGH = -50.0, -38.0
CORE_MIN = 0.12
MIN_RUN = 0.28


def levels(path):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-ac', '1', '-ar', str(RATE), '-f', 's16le', '-'], capture_output=True, check=True).stdout
    samples = struct.unpack(f'<{len(raw) // 2}h', raw[: len(raw) // 2 * 2])
    out = []
    for i in range(0, len(samples) - FRAME, FRAME):
        chunk = samples[i : i + FRAME]
        rms = math.sqrt(sum(s * s for s in chunk) / FRAME) or 1e-9
        out.append(20 * math.log10(rms / 32768))
    return out


def breaths(path):
    db = levels(path)
    loud = [n for n, v in enumerate(db) if v > -35]
    if not loud:
        return []
    first, last = loud[0], loud[-1]
    runs, start = [], None
    for n in range(first, last + 1):
        quiet = LOW <= db[n] <= HIGH
        if quiet and start is None:
            start = n
        if not quiet and start is not None:
            core = sum(1 for k in range(start, n) if CORE_LOW <= db[k] <= CORE_HIGH) * FRAME / RATE
            if (n - start) * FRAME / RATE >= MIN_RUN and core >= CORE_MIN:
                runs.append((round(start * FRAME / RATE, 2), round((n - start) * FRAME / RATE, 2)))
            start = None
    return runs


def main():
    root = sys.argv[1]
    prefix = sys.argv[2] if len(sys.argv) > 2 else ''
    flagged = 0
    for dirpath, _, files in os.walk(root):
        for name in sorted(files):
            if not name.endswith('.mp3'):
                continue
            path = os.path.join(dirpath, name)
            cid = os.path.relpath(path, root)[:-4]
            if not cid.startswith(prefix):
                continue
            found = breaths(path)
            if found:
                flagged += 1
                print(cid, found)
    print(f'flagged {flagged}')


if __name__ == '__main__':
    main()
