
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
     * isResource : path + name == "true"
DONE * getResources : path + name
     * isRepository : path + name == "true"
DONE * getRepositories : path + name
     * getChildRepository : path + name
     * getParentRepository : path + name
     */

 :) 
module namespace  brjx = "http://brjx.stocker-schmid.ch" ;
 

(:~
 : Strip trailing slash 
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_getPaths.html 
 : @param   $input the path from which you wish to get the repositories
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
 : Get all files 
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_getPaths.html 
 : @param   -
 :) 
declare function brjx:getFiles
  ( )   as xs:string* {
  for $db in db:list()
    for $doc in collection($db)
      for $t in $doc/*
        for $r in $t/*
          where $r/record/type/text() = "javascript" or $r/record/type/text() = "xquery"
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
  for $path in brjx:getFiles()
      return replace($path, "(.*)/[^/]*$", "$1")
};

(:~
 : Get all resources in a specified path 
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_getPaths.html 
 : @param   $path the path from which you wish to get the resources 
 :) 
declare function brjx:getResources
  ( $input as xs:string )   as xs:string* {
  let $path := brjx:stripTrailingSlash($input)
  return string-join(
    for $f in brjx:getFiles()
      where $path = replace($f, "(.*)/([^/].*)$", "$1")
        return replace($f, "(.*)/([^/].*)$", "$2")
    , ",")
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
      where starts-with($p, $pattern)
        for $repo in subsequence(tokenize(replace($p, concat("(^.*?)", $pattern), concat("$1","")), "/"), 2, 1)
          where $repo != string-join(subsequence(tokenize(replace($paths[$pos - 1], concat("(^.*?)", $pattern), concat("$1","")), "/"), 2, 1))
            return $repo
    , ",")
};
