---
title: HTTP package
keywords: 
last_updated: October 17, 2023
tags: []
summary: "Detailed description of the API of the HTTP package."
---

## Overview

The HTTP package allows making HTTP requests as well as receiving HTTP requests from
other servers. This is the list of features:

- Send HTTP requests (`GET`, `PUT`, `POST`, etc.) to other servers
- Receive external HTTP requests (`GET`, `PUT`, `POST`, etc.)
- Download files
- Support for basic, digest and oauth authentication
- Support for Cookies, Headers and Query parameters
- Support for JSON and XML content types
- Support for redirects
- Support for SSL

In many cases, you can use the HTTP package to call external services where an official
service does not exist. This will work as long as they provide a REST HTTP API.

## Configuration

### Base URL

If all the requests you will be doing through this service have a common root URL, you can
put it here to avoid having to pass it on every request.

You can also leave this empty and provide the full URL on each request.

### Default headers

Allows defining headers that will be added to all requests done through this service.
The format is `key=value` and you can specify several headers separated by commas:

```
Content-Type=application/json,Accept=application/json
```

### Empty path

If the path is empty when a request is done through the service, this is the default path
that will be used. You can leave this empty if you don't want any default path.

### Authorization

This is the authorization used to make requests. Options are:

- `No authorization`: no authorization will be done. This is the case for public services or when
  you have a custom authorization method (for example, a token sent in headers).
- `Basic authorization`: basic authorization will be used. You will need to provide username
  and password.
- `Digest authorization`: digest authorization will be used. You will need to provide username
  and password.
- `OAuth2 authorization`: OAuth2 digest authorization will be used.

### Username

Username to access the external service. Needed when using `Basic authorization` or
`Digest authorization`.

### Password

Password to access the external service. Needed when using `Basic authorization` or
`Digest authorization`.

### Remember cookies

Enable this flag if you want to use a basic system to exchange cookies with the external
service, where the service will send the last received cookies in subsequent requests.

### Allow External URLs

Disable this flag if you want to restrict the service to only allow requests with the same domain as the service.
This is useful to avoid external requests to other services. This will ignore the `Base URL` configuration.

### Connection timeout

This is the maximum time the service waits to perform the connection to an external
service.
If it times out, an exception is thrown and the request canceled.
Default value: 5000 ms (5 sec).
Set to zero for to wait indefinitely.

### Read timeout

This is the maximum time the service waits to receive the response to a request to
an external service. If it times out, an exception is thrown and the request
canceled. Default value: 60000 ms (60 sec). Set to zero to wait indefinitely.

### Follow redirects

If it is enabled, the service will automatically redirect when it receives a
`3xx` HTTP status code as response to a request.

### Webhook URL

This is the URL the service will be listening for requests, which will be sent as events
to the app.

### Sync Webhook URL

This is the URL the service will be listening for requests, which will be sent as events
to the app.

The difference with the webhooks above is that in this case, the listener should return a
JSON object that will be returned to the caller.

## Quick start

You can make a simple `GET` request like this:

```js
var res = pkg.http.functions.get({
 url: 'https://postman-echo.com/get',
  params: {
    foo1: '1'
  }
});
log('Response: '+ JSON.stringify(res));
```

Also, a `POST` request can send information like this:

```js
var res = pkg.http.functions.post({
  path: '/post', 
  body: {
    name: 'test1'
  }
});
log('Response: '+ JSON.stringify(res));
```
**Note** : In all functions, if you set a Base URL in the package configuration, for example, https://postman-echo.com you can replace 'url:' by 'path:'

If the response code is not `2XX` you can catch the exception:

```js
try {
  pkg.http.functions.post(msg);
} catch (e) {
  log('status code: '+e.additionalInfo.status);
  log('headers: '+JSON.stringify(e.additionalInfo.headers));
  log('body: '+JSON.stringify(e.additionalInfo.body));
}
```

In webhooks, you will have all the information of the request in the event:

```js
sys.logs.info('request info: ' + JSON.stringify(event.data.requestInfo));
sys.logs.info('request headers: ' + JSON.stringify(event.data.headers));
sys.logs.info('request body: ' + JSON.stringify(event.data.body));
```

## Javascript API

All methods in the Javascript API allow the following options:

- `path`: the URL you will send the request. Keep in mind that if you configured a `Base URL` in
  the service this path will be appended to the URL.
- `params`: an object with query parameters for the request (they go in the query string part of
  the request).
- `headers`: an object with headers to send in the request.
  If you provide headers, these will override the ones defined in the service's configuration.
- `body`: this is the body of the request. If you are using JSON, you can directly send an object
  or array, and it will be automatically converted to a JSON string. If you are using an XML content
  type, this will be converted based on the rules defined [above](#xml).
- `fullResponse`: controls what will be set in the response. If `true` the response when calling
  an HTTP method will be an object with fields `status`, `headers` and `body`. This is important
  if you need to check status or headers in the response.
- `connectionTimeout`: overwrites the [`Connection timeout`](#connection-timeout) configuration set on the service only
  for the request.
- `readTimeout`: overwrites the [`Read timeout`](#read-timeout) configuration set on the service only for the
  request.
- `followRedirects`: overwrites the [`Follow redirects`](#follow-redirects) configuration set on the service only for
  the request.

Check each method to see how to pass these options.

### GET requests

You can make `GET` requests like this:

```js
var res = pkg.http.functions.get({
  url: 'https://postman-echo.com/get',
  params: {
    foo1: '1'
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    token: token
  }
});
log(JSON.stringify(res)); // this will print the body of the response
```

If you need to get information of the headers, you can send the `fullResponse` flag in `true`:

```js
var res = pkg.http.functions.get({
  url: 'https://postman-echo.com/get',
  params: {
    foo1: '1'
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    token: token
  },
  fullResponse: true
});
log(JSON.stringify(res.status));
log(JSON.stringify(res.headers));
log(JSON.stringify(res.body));
```

Keep in mind that header keys will be all lower case.

You can also use a shortcut:

```js
var res = pkg.http.functions.get('https://postman-echo.com/get');
```

If you want to overwrite some of the connection values set on the service configuration for only the request, use the
`connectionTimeout`, `readTimeout` and `followRedirects` flags:

```js
var res = pkg.http.functions.get({
  url:'https://postman-echo.com/get',
  connectionTimeout: 1000,  // 1 sec
  readTimeout: 30000,       // 30 sec
  followRedirects: false    // redirects disabled
});
```

#### Downloading files

Through `GET` requests it is possible to download files, and there are some specific features to
make it easier. There are three additional options that can be sent in `GET` requests:

- `forceDownload`: indicates that the resource has to be downloaded into a file instead of
  returning it in the response.
- `downloadSync`: if `true` the method won't return until the file has been downloaded, and it
  will return all the information of the file. See samples below. Default value is `false`.
- `fileName`: if provided, the file will be stored with this name.
  If empty, the file name will be calculated from the URL.

If you want to download a file in a synchronous way, you should do something like this:

```js
var res = pkg.http.functions.get({
  path: '/images/client_400x400.png',
  forceDownload: true,
  downloadSync: true
});

log("response: "+JSON.stringify(res));

// saves the file into a file field
record.field('document').val({
  id: res.fileId,
  name: res.fileName,
  contentType: res.contentType
});
sys.data.save(record);
```

If you don't want to block execution until the download is completed, you can do it asynchronously:

```js
var res = pkg.http.functions.get(
  {
    path: '/images/client_400x400.png',
    forceDownload: true
  },
  {
    record: record  
  },
  {
    fileDownloaded: function(event, callbackData) {
      log("response: "+JSON.stringify(event.data));
    
      // saves the file into a file field
      callbackData.record.field('document').val({
        id: event.data.fileId,
        name: event.data.fileName,
        contentType: event.data.contentType
      });
      sys.data.save(callbackData.record);
    }
  }
);
```

This works like any other callback where the event is `fileDownloaded`.

### POST requests

You can make `POST` requests like this:

```js
var res = pkg.http.functions.post({
  url: 'https://postman-echo.com/post',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: {
    name: 'test 1',
    type: 'a'
  }
});
log(JSON.stringify(res));
```

You can also use a shortcut:

```js
var body = {
  name: 'test 1',
  type: 'a'
};
var res = pkg.http.functions.post('https://postman-echo.com/post', body);
```

### PUT requests

You can make `PUT` requests like this:

```js
var res = pkg.http.functions.put({
  url: 'https://postman-echo.com/put',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: {
    type: 'b'
  }
});
log(JSON.stringify(res));
```

You can also use a shortcut:

```js
var body = {
  type: 'b'
};
var res = pkg.http.functions.put('https://postman-echo.com/put', body);
```

### PATCH requests

You can make `PATCH` requests like this:

```js
var res = pkg.http.functions.patch({
  url: 'https://postman-echo.com/patch',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: {
    type: 'b'
  }
});
log(JSON.stringify(res));
```

You can also use a shortcut:

```js
var body = {
  type: 'b'
};
var res = pkg.http.functions.patch('https://postman-echo.com/patch', body);
```

### DELETE requests

You can make `DELETE` requests like this:

```js
var res = pkg.http.functions.delete({
  url: 'https://postman-echo.com/delete',
  headers: {
    'Accept': 'application/json'
  }
});
log(JSON.stringify(res));
```

You can also use a shortcut:

```js
var res = pkg.http.functions.delete('https://postman-echo.com/delete');
```

### OPTIONS requests

You can make `OPTIONS` requests like this:

```js
var res = pkg.http.functions.options({
  url: 'https://postman-echo.com/options',
  fullResponse: true
});
log(JSON.stringify(res));
```

You can also use a shortcut:

```js
var res = pkg.http.functions.options('https://postman-echo.com/options');
```

### HEAD requests

You can make `HEAD` requests like this:

```js
var res = pkg.http.functions.head({
  url: 'https://postman-echo.com/head',
  fullResponse: true
});
log(JSON.stringify(res));
```

You can also use a shortcut:

```js
var res = pkg.http.functions.head('https://postman-echo.com/head');
```

### Multipart requests

It is possible to send multipart request when using `POST` or `PUT`. This is specially useful when
sending files. It works like this:

```js
var request = {
    path: '/customers/'+customerId+'/documents/'+documentId,
    multipart: true,
    parts: [
        {
            name: 'file',
            type: 'file',
            fileId: record.field('document').id()
        },
        {
            name: 'description',
            type: 'other',
            contentType: 'text/plain',
            content: 'this is a description of the document'
        }
    ]
};
var res = pkg.http.functions.post(request);
```

As you can see, you can send one or many parts in the multipart. Each part has the following fields:

- `name`: the name of the field in the multipart.
- `type`: can be `file` if it is a file or `other` if it is any other content.
- `fileId`: this is the ID of the file in the app. Required if `type` is `file`.
- `contentType`: this is the content type of the part. Only when `type` is `other` and it is optional.
- `content`: this is the content of the type. Could be a JSON or a string. Required when `type` is `other`.

## Events

### Webhooks

When an external service calls the webhook URL, an event will be triggered in the app that you can
catch in a listener like this one:

```js
sys.logs.info('request info: ' + JSON.stringify(event.data.requestInfo));
sys.logs.info('request headers: ' + JSON.stringify(event.data.headers));
sys.logs.info('request body: ' + JSON.stringify(event.data.body));
```

Keep in mind that header keys will be in lower case.

The field `requestInfo` contains this information:

- `method`: it is the HTTP verb, like `POST`, `GET`, etc.
- `url`: the full URL of the request, like `https://app.slingrs.io/:env/services/http/http`.
- `encoding`: encoding of the request, like `UTF-8`.

Keep in mind that the service will just respond with `200` status code with `ok` as the body, and
you won't be able to provide a custom response.

### Sync Webhooks

This works exactly the same as the regular webhooks with the only difference that you can return
the response from the listener that process the webhook. For example, the listener could be like
this:

```js
var res = {
    status: app.orders.process(event.data),
    date: new Date()
};
return res;
```

Keep in mind that the response should be a valid JSON.

## About SLINGR

SLINGR is a low-code rapid application development platform that accelerates development, with robust architecture for integrations and executing custom workflows and automation.

[More info about SLINGR](https://slingr.io)

## License

This service is licensed under the Apache License 2.0. See the `LICENSE` file for more details.
