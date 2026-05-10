# SQL apostrophe escaping cheat sheet

If you must hand-write SQL with text containing apostrophes (Italian `dell'`, English `don't`, etc.),
**double the apostrophe** to escape it.

## Wrong
```sql
'DAL CUORE DELL'HIMALAYA ALLA PATRIA DEL RINASCIMENTO'
'don't worry'
'L'opera'
```

## Right
```sql
'DAL CUORE DELL''HIMALAYA ALLA PATRIA DEL RINASCIMENTO'
'don''t worry'
'L''opera'
```

## Even better — use dollar-quoted strings

PostgreSQL supports `$$...$$` and `$tag$...$tag$` strings that ignore apostrophes entirely:

```sql
$$DAL CUORE DELL'HIMALAYA ALLA PATRIA DEL RINASCIMENTO$$
$$don't worry$$
$body$L'opera incontra l'altro$body$
```

This is what `schema_v2.sql` uses for body content with markdown — search for `$body$` in that file.

## But really — use the admin panel instead

Once Phase 2 is deployed, you should never write SQL by hand. Go to `/admin`, log in, edit
content through forms. The forms handle escaping automatically.
