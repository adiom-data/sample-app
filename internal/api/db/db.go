package db

import (
	"context"
	"database/sql"
	"errors"
	"net"
	"net/url"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

type Config struct {
	Host     string
	Port     string
	Database string
	User     string
	Password string
	SSLMode  string
}

func Open(cfg Config) (*sql.DB, error) {
	if strings.TrimSpace(cfg.Host) == "" {
		return nil, errors.New("database host is required")
	}
	return sql.Open("pgx", postgresURL(cfg))
}

func Ping(ctx context.Context, db *sql.DB) error {
	if db == nil {
		return errors.New("database is not configured")
	}
	pingCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()
	return db.PingContext(pingCtx)
}

func valueOrDefault(value, fallback string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return fallback
	}
	return value
}

func postgresURL(cfg Config) string {
	values := url.Values{}
	values.Set("sslmode", valueOrDefault(cfg.SSLMode, "disable"))
	return (&url.URL{
		Scheme:   "postgres",
		User:     url.UserPassword(valueOrDefault(cfg.User, "postgres"), cfg.Password),
		Host:     net.JoinHostPort(valueOrDefault(cfg.Host, "localhost"), valueOrDefault(cfg.Port, "5432")),
		Path:     valueOrDefault(cfg.Database, "postgres"),
		RawQuery: values.Encode(),
	}).String()
}
