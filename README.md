# Family Day

The approved guide now uses the original public routes. Its maintained implementation and build instructions are in [site/README.md](site/README.md).

```sh
python site/build-site.py
python -m http.server 8112 --bind 127.0.0.1
```

Ordering/preparation portals retain their original URLs and design. They read the independent [service catalogue](data/services.json), so replacing the home page does not affect orders. [Cutover status](site/MIGRATION_PLAN.md) documents compatibility and the completed, owner-approved legacy cleanup. The three ordering experiences and their assets remain intact.
