
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


     /** TODO BRjx Api Procedures
PASS  * isResource : path + name == "true"
PASS  * getResources : path
PASS  * isRepository : path + name == "true"
PASS  * getRepositories : path
      * needed ? --> getChildRepository : path + name
      * js only ? --> getParentRepository : path
CHECK * getLastModified : path + name
CHECK * getContent : path + name
CHECK * getLength : path + name
      * getName : path --> js only
      */

:) 
module namespace  brjx = "http://brjx.stocker-schmid.ch" ;
 

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
 : Get all records 
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_getRecords.html 
 : @param   -
 :) 
declare function brjx:getRecords
  ( )   as xs:string* {
  for $db in db:list()
    for $doc in collection($db)
      for $t in $doc/*
        for $r in $t/*
          where $r/record/type/text() = "js" or $r/record/type/text() = "xq"
            for $f in $r/record/name/text()
              return document-uri($doc)||"/" ||$f||"."||$f/../../type/text()
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
  ( $input as xs:string,
    $resource as xs:string )   as xs:string {
  let $path := brjx:stripTrailingSlash($input)
  return string(string-length(doc($path)//*[./name/text() = tokenize($resource, "\.")[1] and ./type/text() = tokenize($resource, "\.")[2]]/script))
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
  ( $input as xs:string,
    $resource as xs:string )   as xs:string {
  let $path := brjx:stripTrailingSlash($input)
  return doc($path)//*[./name/text() = tokenize($resource, "\.")[1] and ./type/text() = tokenize($resource, "\.")[2]]/script/text()
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
 : return a value of type long (current-dateTime() - xs:dateTime("1970-01-01T00:00:00-00:00")) div xs:dayTimeDuration('PT0.001S')
 :) 
declare function brjx:getLastModified 
  ( $input as xs:string )   as xs:string {
  let $path := brjx:stripTrailingSlash($input)
  return string((current-dateTime() - xs:dateTime(db:list-details(tokenize($path, "/")[2])[./text() = replace($path, "/" || tokenize($path, "/")[2] || "/", "")]//@modified-date/data())) div xs:dayTimeDuration('PT0.001S'))
};