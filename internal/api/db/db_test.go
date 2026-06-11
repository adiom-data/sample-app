package db

import (
	"net/url"
	"testing"
)

func TestPostgresURLEscapesCredentials(t *testing.T) {
	dsn := postgresURL(Config{
		Host:     "sample-postgres-rw",
		Port:     "5432",
		Database: "app db",
		User:     "app user",
		Password: `pa ss'"\word`,
		SSLMode:  "disable",
	})

	parsed, err := url.Parse(dsn)
	if err != nil {
		t.Fatalf("parse DSN: %v", err)
	}
	if got := parsed.User.Username(); got != "app user" {
		t.Fatalf("username = %q, want %q", got, "app user")
	}
	gotPassword, _ := parsed.User.Password()
	if gotPassword != `pa ss'"\word` {
		t.Fatalf("password = %q, want original password", gotPassword)
	}
	if got := parsed.Path; got != "/app db" {
		t.Fatalf("path = %q, want %q", got, "/app db")
	}
	if got := parsed.Query().Get("sslmode"); got != "disable" {
		t.Fatalf("sslmode = %q, want %q", got, "disable")
	}
}
