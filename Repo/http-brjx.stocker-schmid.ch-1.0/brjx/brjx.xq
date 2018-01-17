(:~

 : --------------------------------
 : The BRjx XQuery Function Library
 : --------------------------------

 : Copyright (C) 2017

 : This library is free software; you can redistribute it and/or
 : modify it under the terms of the GNU Lesser General Public
 : License as published by the Free Software Foundation; either
 : version 2.1 of the License.

 : This library is distributed in the hope that it will be useful,
 : but WITHOUT ANY WARRANTY; without even the implied warranty of
 : MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 : Lesser General Public License for more details.

 : You should have received a copy of the GNU Lesser General Public
 : License along with this library; if not, write to the Free Software
 : Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA

 : For more information on the BRjx XQuery library, contact arthur@stocker-schmid.ch.

 : @version 1.0
 : @see     


     /** BRjx Api Procedures
PASS  * isResource : path + name == "true"
PASS  * getResources : path
PASS  * isRepository : path + name == "true"
PASS  * getRepositories : path
      * TODO : needed ? --> getChildRepository : path + name
      * getParentRepository : path --> js only
CHECK * getLastModified : path + name
CHECK * getContent : path + name
CHECK * getLength : path + name
      * getName : path --> js only
      */

:) 
module namespace  brjx = "http://brjx.stocker-schmid.ch" ;
 
declare variable $brjx:SystemServerClient := ("boot.xml", "app.xml", "jobs.xml", "macros.xml", "modules.xml", "mountpoints.xml", "components.xml", "scripts.xml");
declare variable $brjx:SystemServer := ("boot.xml", "app.xml", "jobs.xml", "macros.xml", "modules.xml", "mountpoints.xml");
declare variable $brjx:System := ("boot.xml", "app.xml", "macros.xml");
declare variable $brjx:Server := ("jobs.xml", "modules.xml", "mountpoints.xml");
declare variable $brjx:Client := ("components.xml", "scripts.xml");
declare variable $brjx:Cache := ("mountpoints.xml");
declare variable $brjx:pkg := ("/BRjx_packages/");


(:~
 : Strip trailing slash 
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_getstripTrailingSlash.html 
 : @param   $input the path from which you wish to remove the trailing slash
 :) 
declare function brjx:stripTrailingSlash
  ( $input as xs:string )   as xs:string {
  let $path := replace($input, "//+", "")
  let $output := if (replace($path, ".*(.)$", "$1") != "/" or $path = "/" or $path = "") then (
    if ($path != "") then (
      $path
    ) else (
      "/"
    )
  ) else (
    replace($path, "(.*)/[^/]*$", "$1")
  )
  return $output
};

(:~
 : Get all documents    $bundle = "app.xml"  or $bundle = "macros.xml" or $bundle = "modules.xml" or $bundle = "components.xml" or $bundle = "boot.xml" or $bundle = "jobs.xml"
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_getBundles.html 
 : @param   -
 :) 
declare function brjx:getDocs
  ( $list as item()* )   as node()* {
  for $db in db:list()
    for $doc in collection($db)
      let $bundle := replace(document-uri($doc), "(.*)/([^/].*)$", "$2")
      where $bundle = $list
        return $doc
};

(:~
 : Get all bundles 
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_getBundles.html 
 : @param   -
 :) 
declare function brjx:getBundles
  ( )   as xs:string* {
  (:
  for $doc in brjx:getDocs($brjx:SystemServerClient)
    return document-uri($doc)
  :)
  $brjx:pkg 
};

(:~
 : Get all records 
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_getRecords.html 
 : @param   -
 :) 
declare function brjx:getRecords
  ( )   as xs:string* {
  for $doc in brjx:getDocs($brjx:SystemServerClient) 
    for $t in $doc/*
      for $r in $t/*          
        for $f in $r/record
          return $brjx:pkg || $f/path/text() || $f/name/text() || "." || $f/type/text()
};

(:~
 : Get all paths 
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_getPaths.html 
 : @param   -
 :) 
declare function brjx:getPaths
  ( )   as xs:string* {
  for $path in brjx:getRecords()
      return replace($path, "(.*)/([^/].*)$", "$1")
};

(:~
 : Get all files 
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_getFiles.html 
 : @param   -
 :) 
declare function brjx:getFiles
  ( )   as xs:string* {
  for $path in brjx:getRecords()
      return replace($path, "(.*)/([^/].*)$", "$2")
};

(:~
 : Is specified path and name a resources
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_isResource.html 
 : @param   $input the path and name of the resource to check
 :) 
declare function brjx:isResource
  ( $input as xs:string )   as xs:string* {
  let $path := brjx:stripTrailingSlash($input)
  return if (
      (for $f in brjx:getRecords()
        where $f = $path
          return $f)
    ) then ("true") else ("false")
};

(:~
 : Get all resources in a specified path 
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_getPaths.html 
 : @param   $input the path from which you wish to get the resources 
 :) 
declare function brjx:getResources
  ( $input as xs:string )   as xs:string* {
  let $path := brjx:stripTrailingSlash($input)
  return string-join(
    for $f in brjx:getRecords()
      where $path = replace($f, "(.*)/([^/].*)$", "$1")
        return replace($f, "(.*)/([^/].*)$", "$2")
    , ",")
};

(:~
 : Is specified path and name a repository
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_isRepository.html 
 : @param   $input the path and name of the repository to check
 :) 
declare function brjx:isRepository
  ( $input as xs:string )   as xs:string* {
  let $path := brjx:stripTrailingSlash($input)
  return if (
      (for $f in tokenize(brjx:getRepositories(replace($path, "(.*)/([^/].*)$", "$1")), ",")
        where $f = replace($path, "(.*)/([^/].*)$", "$2")
          return $f)
    ) then ("true") else ("false")
};

(:~
 : Get all repositories in a specified path 
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_getRepositories.html 
 : @param   $input the path from which you wish to get the repositories 
 :) 
declare function brjx:getRepositories 
  ( $input as xs:string )   as xs:string {
  let $pattern := brjx:stripTrailingSlash($input)
  let $paths := brjx:getPaths()
  return string-join(
    for $p at $pos in $paths
      where starts-with($p, $pattern) and (starts-with(replace($p, $pattern, ""), "/") or $pattern = "/")
        for $repo in subsequence(
                tokenize(
                  if ($pattern = "/") then (
                    $p
                  ) else ( 
                    replace(" " ||
                      replace($p, $pattern, "")
                      , "[^/]+(.*)", "$1")
                  )
                , "/") 
              , 2, 1)(:"(^.*?)":)
          where $repo != string-join(subsequence(
                tokenize(
                  if ($pattern = "/") then (
                    $paths[$pos - 1]
                  ) else ( 
                    replace(" " ||
                      replace($paths[$pos - 1], $pattern, "")
                      , "[^/]+(.*)", "$1")
                  )
                , "/")
              , 2, 1))
            return $repo
    , ",")
};

(:~
 : Get content length of a resource in repository at a specified path 
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_getLength.html 
 : @param   $input the path from which you wish to get the repository 
 : @param   $resource the name of the resource from wich you wish to get the length
 :)
declare function brjx:getLength 
  ( $input as xs:string )   as xs:string {
  let $path := brjx:stripTrailingSlash($input)
  let $repository := replace($path, "(.*)/([^/].*)$", "$1/")
  let $resource := replace($path, "(.*)/([^/].*)$", "$2")
  for $doc in brjx:getDocs($brjx:SystemServerClient)
    for $r in $doc//*/record
      where $r[./path/text() = replace($repository, $brjx:pkg, "") and ./name/text() = tokenize($resource, "\.")[1] and ./type/text() = tokenize($resource, "\.")[2]]
        return string(string-length($r/script))
};

(:~
 : Get content length of a resource in repository at a specified path 
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_getContent.html 
 : @param   $input the path from which you wish to get the repository 
 : @param   $resource the name of the resource from wich you wish to get the content
 :)
declare function brjx:getContent
  ( $input as xs:string )   as element()* {
  let $path := brjx:stripTrailingSlash($input)
  let $repository := replace($path, "(.*)/([^/].*)$", "$1/")
  let $resource := replace($path, "(.*)/([^/].*)$", "$2")
  let $basename := replace($resource, "(.*)\.([^\.]*)$", "$1")
  let $extension := replace($resource, "(.*)\.([^\.]*)$", "$2")  
  for $doc in brjx:getDocs($brjx:SystemServerClient)
    for $r in $doc//*/record
     where $r[./path/text() = replace($repository, $brjx:pkg, "") and ./name/text() = $basename and ./type/text() = $extension]
        return $r
};

(:~
 : Get content length of a resource in repository at a specified path 
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_getLastModified.html 
 : @param   $input the path from which you wish to get the last-modified date of the repository or resource
 :          (modified date of a repository or resource is the same as they are stored in the same db)
 :
 : return a value of type long. As Javascript cannot represent 64bit Java long we add a _ in front to return a string and remove it in the Java Class before conversion.
 :) 
 declare function brjx:getLastModified 
  ( $input as xs:string )   as xs:string {
  let $repository := replace($input, "(.*)/([^/]*)$", "$1/")
  let $resource := replace($input, "(.*)/([^/]*)$", "$2")
  for $doc in brjx:getDocs($brjx:SystemServerClient)
    let $bundle := replace(document-uri($doc), "(.*)\.([^\.][^/]*).*$", "$1.$2")
    where $doc//*/record[./path/text() = replace($repository, $brjx:pkg, "") ]
      return string((xs:dateTime(db:list-details()[./text() = tokenize($bundle, "/")[2]]//@modified-date/data()) - xs:dateTime('1970-01-01T00:00:00-00:00')) div xs:dayTimeDuration('PT0.001S'))
};


declare function brjx:getModulesLastModified
  ( )   as element()? { 
  element {"lastModified"} {
    max(
      for $doc in brjx:getDocs($brjx:Server)
        for $timeStamp in db:list-details()
          where $timeStamp/text() = replace(document-uri($doc), "/([^/]*)/([^/].*)$", "$1") 
          return string((xs:dateTime($timeStamp//@modified-date/data()) - xs:dateTime("1970-01-01T00:00:00-00:00")) div xs:dayTimeDuration("PT0.001S"))
    )
  }
};


declare function brjx:getCacheItems
  ( )   as element()? { 
  element {"cache"} {
    for $doc in brjx:getDocs($brjx:Cache)
      let $class := replace(document-uri($doc), "(.*)/([^/][^\.]*)(.*)$", "$2")
      group by $class
      order by $class
      return element {$class} {
          for $f in $doc//*[name() = "script"]/..
            return element {"path"} {$f/path/text() || $f/name/text() || "." || $f/type/text()}
      }
  }
};