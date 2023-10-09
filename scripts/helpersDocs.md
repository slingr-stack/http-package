# Javascript API

The Javascript API of the http package has three pieces:

- **HTTP requests**: These allow making regular HTTP requests.
- **Shortcuts**: These are helpers to make HTTP request to the API in a more convenient way.
- **Additional Helpers**: These helpers provide additional features that facilitate or improves the package usage in SLINGR.

## HTTP requests
You can make `GET` requests to the [http API](API_URL_HERE) like this:
```javascript
var response = pkg.http.functions.get('/sync')
```

Please take a look at the documentation of the [HTTP service](https://github.com/slingr-stack/http-service)
for more information about generic requests.

## Shortcuts

Instead of having to use the generic HTTP methods, you can (and should) make use of the helpers provided in the package:
<details>
    <summary>Click here to see all the helpers</summary>

<br>

* API URL: '/sync'
* HTTP Method: 'GET'
```javascript
pkg.http.functions.sync.get()
```
---

</details>

