#### Installation
```sh
npm install
```

#### Usage
```sh
. ./update.sh
```

### Configuration
Set a Tumblr blog in `config.json`
```json
{
    "tumblr" : "projectsecretidentity.tumblr.com",
    "type": "photo"
}
```

### Advanced Usage
Pass a Git repository to `update.sh`, and the script with push JSON there after crawling
```sh
. ./update git@github.com:EFForg/projectsecretidentity.git
```
