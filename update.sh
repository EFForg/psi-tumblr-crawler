# Crawl Tumblr and save JSON
node lib/tumblr.js
echo "Saved to './data/posts.json'"

# Push updated JSON to Git repository
if [ "$1" ]; then
    git clone $1 repo

    cd repo
    git pull
    mkdir data
    cp ../data/posts.json data/
    git add data/
    git commit -m "Updating posts JSON"
    git push

    # Return
    cd ..
fi

