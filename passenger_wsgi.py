import sys

import os

INTERP = os.path.expanduser("/var/www/u3479260/data/www/mkir-resume.ru/resume/.venv/bin/python")
if sys.executable != INTERP:
   os.execl(INTERP, INTERP, *sys.argv)

sys.path.append(os.getcwd())

from server.main import application