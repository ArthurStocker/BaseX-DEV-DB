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

declare variable $brjx:SystemServerClient := ("boot.xml", "rc.xml", "rds.xml", "jobs.xml", "macros.xml", "modules.xml", "applications.xml", "components.xml", "scripts.xml");
declare variable $brjx:SystemServer := ("boot.xml", "rds.xml", "jobs.xml", "macros.xml", "modules.xml", "applications.xml");
declare variable $brjx:System := ("boot.xml", "rds.xml", "macros.xml");
declare variable $brjx:Server := ("jobs.xml", "modules.xml", "applications.xml");
declare variable $brjx:Client := ("components.xml", "scripts.xml");
declare variable $brjx:Cache := ("applications.xml");
declare variable $brjx:pkg := ("/BRjx_packages/");


(:~
 : Get config value for key
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_getConfigValueForKey.html 
 : @param   $key the key from which you wish to get the config value
 :) 
declare function brjx:getConfigValueForKey
  ( $key as xs:string )   as xs:string {
  for $line in tokenize(file:read-text(db:option("repopath") || "/config.cfg"), "\n")
    let $keyvalue := tokenize($line, "=")
    where $keyvalue[1] = $key
    return $keyvalue[2]
};

(:~
 : Get config value for key
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_setTimeStamp.html 
 : @param   $action is the name of the timestamp to be updated, and $record the record to be updated, $value the timestamp
 :)
declare updating function brjx:setTimeStamp
  ( $action as xs:string,
    $record as item()*,
    $value as item()* )   as empty-sequence() {
  let $elem := attribute {$action} {$value}
  return if (not($record/@*[local-name(.) = $action])) 
    then (insert node ($elem) as last into $record)
    else (replace node ($record/@*[local-name(.) = $action]) with $elem)
};

(:~
 : Get config value for key
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_setTimeStamps.html 
 : @param   $action is the name of the timestamp to be updated, and $record the record to be updated
 :)
declare updating function brjx:setTimeStamps
  ( $action as xs:string,
    $record as item()* )   as empty-sequence() {
  switch ($action)
    case "create"
    case "read"
    case "update"
    case "delete" return brjx:setTimeStamp($action, $record, adjust-dateTime-to-timezone(xs:dateTime(current-dateTime()),xs:dayTimeDuration("PT0H")))
    default return
      for $db in db:list()
        for $doc in collection($db)
          for $record in $doc//record
            for $action in ( "create", "read", "update", "delete" )
              return brjx:setTimeStamp($action, $record, if ($action = "delete") then ("") else (adjust-dateTime-to-timezone(xs:dateTime(current-dateTime()),xs:dayTimeDuration("PT0H"))))
};

(:~
 : Track record access
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_trackRecordAccess.html 
 : @param   record
 :)
declare updating function brjx:trackRecordAccess
  ( $action as xs:string,
    $id as item()* )  as empty-sequence() {
  for $db in db:list()
    for $doc in collection($db)
      for $record in $doc//record
        where $record/@id = $id
          return brjx:setTimeStamps($action, $record)
};

(:~
 : Get get all template XML files from the template directory
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_getTemplateItems.html 
 : @param   -
 :) 
declare function brjx:getTemplateItems
  ( )   as element()? { 
  element {"templates"} { 
    attribute {"id"} {random:uuid()},
    element {"records"} {
      let $template := brjx:getConfigValueForKey("template")
      for $file in file:list($template, true(), "*.xml")
        where $file != "users.xml"
          return element {"record"} {
            attribute {"id"} {random:uuid()},
            attribute {"create"} {adjust-dateTime-to-timezone(xs:dateTime(current-dateTime()),xs:dayTimeDuration("PT0H"))},
            attribute {"read"} {adjust-dateTime-to-timezone(xs:dateTime(current-dateTime()),xs:dayTimeDuration("PT0H"))},
            attribute {"update"} {adjust-dateTime-to-timezone(xs:dateTime(current-dateTime()),xs:dayTimeDuration("PT0H"))},
            attribute {"delete"} {""},
            element {"path" } {$template || $file},
            element {"name"} {replace($file, ".*/([^\.]*)\..*", "$1")},
            element {"type"} {replace($file, ".*/[^\.]*\.(.*)", "$1")},
            element {"properties"} {
              element {"db"} {replace($file, "([^/]*)/.*", "$1")},
              element {"doc"} {replace($file, "[^/]*/(.*)", "$1")},
              element {"lastModified"} {file:last-modified($template|| $file)}
            }
          }
    }
  }
};

(:~
 : Create or update CHACHE DB with the template information
 : and replace the corresponding files in the DB if the template changes
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_checkTemplateItems.html 
 : @param   -
 :) 
declare updating function brjx:checkTemplateItems
  ( )   as empty-sequence() {
  let $cache := "CACHE"
  return if (db:exists($cache))
    then (
      let $db := db:open("CACHE")
      for $template in brjx:getTemplateItems()/records/*
        let $cacheitem := $db//*[./path/text() = $template/path/text()]
        where $cacheitem/path/text() = $template/path/text() and $cacheitem/properties/lastModified/text() != $template/properties/lastModified/text()
          for $elem in (attribute {"update"} {current-dateTime()}, element {"file"} {$template}, element {"lastModified"} {$template/properties/lastModified/text()})
            return switch ($elem/name())
              case "update" return brjx:setTimeStamps($elem/name(), $cacheitem)
              case "file" return db:replace($elem/record/properties/db/text(), $elem/record/properties/doc/text(), xs:string($elem/record/path/text()))
              case "lastModified" return replace node ($cacheitem/properties/lastModified) with $elem
              default return ()
    )
    else (db:create($cache, brjx:getTemplateItems(), "templates.xml"))
};

(:~
 : Create DB from template
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_createDBfromTemplate.html 
 : @param   -
 :) 
declare updating function brjx:createDBfromTemplate
  ( )   as empty-sequence() {
  let $template := brjx:getConfigValueForKey("template")
  let $target := brjx:getConfigValueForKey("target")
  for $step in (1, 2, 3, 4)
    return switch ($step) 
      case 1 return file:copy($template || "users.xml", $target || "users.xml")
      case 2 return 
        for $file in file:list($template, false(), "BR*")
          return db:create(replace($file, "/", ""), brjx:getConfigValueForKey("template") || $file, (), map { "autooptimize": true(), "updindex":true(), "textindex": true(), "textinclude": "path, name, type, *:path, *:name, *:type, Q{uri}path, Q{uri}name, Q{uri}type, Q{uri}*, *", "attrindex": true(), "attrinclude": "id, create, read, update, delete, *:id, *:create, *:read, *:update, *:delete, Q{uri}id, Q{uri}create, Q{uri}read, Q{uri}update, Q{uri}delete, Q{uri}*, *" })
      case 3 return
        let $job := jobs:eval('import module namespace brjx = "http://brjx.stocker-schmid.ch"; brjx:checkTemplateItems()', (), map { "id": "checktemplates", "interval": "PT15S", "service": true() })
        return ()
      case 4 return
        let $job := jobs:eval('import module namespace brjx = "http://brjx.stocker-schmid.ch"; declare variable $action external; declare variable $record external; brjx:setTimeStamps($action, $record)', map { "action": "", "record": ""}, map {"id": "settimestamps"} )
        return ()
      default return ()
};

(:~
 : Create DB from template
 :
 : @author  Arthur Stocker 
 : @version 1.0 
 : @see     http://brjx.stocker-schmid.ch/api/BasexRepository_exportDBtoTemplatePath.html 
 : @param   -
 :) 
declare updating function brjx:exportDBtoTemplatePath
  ( )   as empty-sequence() {
  let $template := brjx:getConfigValueForKey("template")
  let $target := brjx:getConfigValueForKey("target")
  for $step in (1, 2)
    return switch ($step)
      case 1 return 
        for $db in db:list()
          return db:export($db, $template || "export/" || $db, map { "method": "xml", "cdata-section-elements": "script" })
      case 2 return file:copy($target || "users.xml", $template || "export/users.xml")
      default return ()
};

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
      (:
      return string((xs:dateTime(db:list-details()[./text() = tokenize($bundle, "/")[2]]//@modified-date/data()) - xs:dateTime("1970-01-01T00:00:00-00:00")) div xs:dayTimeDuration("PT0.001S"))
      :)
      for $r in $doc//*/record
      where $r[./path/text() = replace($repository, $brjx:pkg, "") and ./name/text() = replace($resource, "(.*)\.([^\.]*)", "$1") and ./type/text() = replace($resource, "(.*)\.([^\.]*)", "$2")]
      return if ($r/@update) 
        then ( string((xs:dateTime($r/@update/data()) - xs:dateTime("1970-01-01T00:00:00-00:00")) div xs:dayTimeDuration("PT0.001S")) )
        else ( string((xs:dateTime(db:list-details()[./text() = tokenize($bundle, "/")[2]]//@modified-date/data()) - xs:dateTime("1970-01-01T00:00:00-00:00")) div xs:dayTimeDuration("PT0.001S")) )
};






(:
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
:)



declare function brjx:getCacheItems
  ( )   as element()? { 
  element {"cache"} {
    for $doc in brjx:getDocs($brjx:Cache)
      let $class := replace(document-uri($doc), "(.*)/([^/][^\.]*)(.*)$", "$2")
      group by $class
      order by $class
      return element {$class} {
        for $a in distinct-values(
          for $f in $doc//*[name() = "script"]/..
            return  replace($f/path/text(), "([^/]*)/(.*)$", "$1")
        )
          return element {"application"} {$a}
      }
  }
};