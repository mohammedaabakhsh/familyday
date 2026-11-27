"""Current exit policy: internal navigation preserves orders; true exits clear them.
The v115 session suite supersedes the previous cancel-means-exit assertions.
Chalet-specific ordering remains covered by check-chalet-guest-services.py.
"""
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).with_name('check-order-session.py')),run_name='__main__')
