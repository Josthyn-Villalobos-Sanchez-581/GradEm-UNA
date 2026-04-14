from pathlib import Path
path = Path(r'd:\UniversidadGerald\xampp\htdocs\GradEm-UNA\backend\resources\js\pages\Eventos\Index.tsx')
text = path.read_text(encoding='utf-8')
lines = text.splitlines()
needle = '          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">'
for i, line in enumerate(lines):
    if line == needle:
        lines[i] = '        {view === "list" ? ('
        lines.insert(i+1, needle)
        break
else:
    raise SystemExit('start needle not found')
start = None
for i, line in enumerate(lines):
    if line.strip() == "{view === 'list' && (" and line.startswith('        '):
        start = i
        break
if start is None:
    raise SystemExit('duplicate start not found')
end = None
for j in range(start+1, len(lines)):
    if lines[j].strip() == ')}' and j+1 < len(lines) and lines[j+1].strip() == ') : (':
        end = j
        break
if end is None:
    raise SystemExit('duplicate end not found')
for _ in range(end - start + 1):
    lines.pop(start)
path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('updated')
