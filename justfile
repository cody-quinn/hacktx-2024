# Show this message
help:
    @awk '/^#/{c=substr($$0,3);next}c&&/^[[:alpha:]][[:alnum:]_-]+:/{print substr($$1,1,index($$1,":")),c}1{c=0}' justfile | column -s: -t

# Run the application
dev: setup
    concurrently \
        --names "FRONTEND,BACKEND" \
        -c "blue,green" \
        "just frontend-dev" \
        "just backend-dev"

generate-client:
    pnpm -C frontend run generate-client

# Generate the database
datagen:
    uv --project app run app/datagen.py

setup:
    pnpm install

frontend-dev:
    pnpm -C frontend run dev

backend-dev:
    DEBUG=true uv --project app run fastapi dev