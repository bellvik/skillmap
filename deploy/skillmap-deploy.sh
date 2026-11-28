#!/usr/bin/env bash
set -Eeuo pipefail

exec 9>/run/lock/skillmap-deploy.lock
flock -n 9 || {
  echo "Another SkillMap deployment is already running." >&2
  exit 1
}

cd /opt/skillmap

image=skillmap-skillmap:latest
previous=skillmap-skillmap:previous
has_previous=false

if docker image inspect "$image" >/dev/null 2>&1; then
  docker tag "$image" "$previous"
  has_previous=true
fi

gzip -dc | docker load

wait_for_health() {
  local attempt container health state

  for attempt in $(seq 1 30); do
    container=$(docker compose ps -q skillmap)
    if [[ -n "$container" ]]; then
      health=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$container")
      state=$(docker inspect --format '{{.State.Status}}' "$container")
      if [[ "$health" == healthy ]]; then
        return 0
      fi
      if [[ "$state" == exited || "$state" == dead ]]; then
        return 1
      fi
    fi
    sleep 2
  done

  return 1
}

restore_previous() {
  if [[ "$has_previous" == true ]]; then
    echo "Deployment failed; restoring the previous image." >&2
    docker tag "$previous" "$image"
    docker compose up -d --no-build --force-recreate skillmap || true
  fi
}

if ! docker compose up -d --no-build --force-recreate skillmap; then
  docker compose logs --tail=80 >&2 || true
  restore_previous
  exit 1
fi

if wait_for_health; then
  echo "SkillMap deployed and healthy."
  exit 0
fi

docker compose logs --tail=80 >&2 || true
restore_previous

exit 1
