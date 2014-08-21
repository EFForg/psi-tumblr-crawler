# Relativity
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")

# Crawl Tumblr and save JSON
node "$SCRIPTPATH/lib/tumblr.js"

# Push updated JSON to Git repository
if [ "$1" ]; then
    git clone $1 repo

    cd "$SCRIPTPATH/repo"
    git pull
    mkdir data
    cp ../data/posts.json data/
    git add data/
    git commit -m "Updating posts JSON"
    git push

    # Return
    cd ..
fi

