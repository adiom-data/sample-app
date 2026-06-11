package db

import (
	"context"
	"database/sql"
)

func UpsertUser(ctx context.Context, db *sql.DB, issuer, subject, email, name string) (string, error) {
	var id string
	err := db.QueryRowContext(ctx, `
insert into app_users (external_issuer, external_subject, email, name)
values ($1, $2, $3, $4)
on conflict (external_issuer, external_subject) do update
set email = excluded.email,
    name = excluded.name,
    updated_at = now()
returning id
`, issuer, subject, email, name).Scan(&id)
	return id, err
}
