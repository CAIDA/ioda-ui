# ioda-ui
Web application UI for the IODA project (https://ioda.caida.org)
- [IODA server deployment](http://github.com/CAIDA/ioda-deploy)


## Install
1. Ensure PHP 7.2 is running on your machine.
2. Clone repo locally 
3. run `brew install composer yarn`
4. run `curl -sS https://get.symfony.com/cli/installer | bash`
5. run `composer install`
6. run `yarn install`

## Run 
the code is actually two processes
- yarn compiles the javascript, (watch keeps it checking for updates)
    ~~~
    yarn encore dev --watch
    ~~~
- symfony runs the server, there are two ways
    - if you have symfony: 
    ~~~
    symfony server:start --no-tls
    ~~~
    - if you only have php:
    ~~~
    php -S 127.0.0.1:8000 -t public
    ~~~

Check localhost in browser

# possible problems and error messages
~~~
    [ErrorException]   curl_multi_setopt(): CURLPIPE_HTTP1 is no longer supported
~~~

I fixed it by:
1. Updating the global symfony/flex using `composer global require symfony/flex ^1.5` 
2. Removing the `vendor/symfony/flex` directory in my project.
3. Running `composer update`.

~~~
    PHP Fatal error:  require(): Failed opening required '/.../ioda-ui/vendor/autoload.php' (include_path='.:/usr/local/Cellar/php@7.2/7.2.25/share/php@7.2/pear') in .../ioda-ui/config/bootstrap.php on line 5
~~~

Fix it by running `composer install` in the /ioda-ui/ folder.
