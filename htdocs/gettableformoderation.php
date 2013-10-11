/*
 *    Copyright (C) 2013 Local Play
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License as
 *    published by the Free Software Foundation, either version 3 of the
 *    License, or (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

<?php
	//
	// validate session
	//
    require_once( "session.php" );
    if ( !validatesession() || $_SESSION['creatorrole'] < 1 ) {
        echo '{ "status" : "FAILED", "message" : "You are not registered as an administrator" }';  
        exit();
    }
    if ($_GET) {
        try {
            //
            // connect to database
            //
            require_once( "db.php" );
            $db = new DBConnection;
            $db->connect();
            //
            //
            //
            $tablename = $_GET[ 'tablename' ];
            $islevel = strcmp( $tablename, "level" ) === 0;
            $ismedia = strcmp( $tablename, "media" ) === 0;
            $getflagged = isset($_GET[ 'flagged' ]) ? $_GET[ 'flagged' ] : 0;
            $gettoppicks = isset($_GET[ 'toppicks' ]) ? $_GET[ 'toppicks' ] : 0;
            $filter = isset( $_GET[ 'filter' ] ) ? $_GET[ 'filter' ] : "";
            $offset = isset( $_GET[ 'offset' ] ) ? $_GET[ 'offset' ] : 0;
            $limit = isset( $_GET[ 'limit' ] ) ? $_GET[ 'limit' ] : 0;
            //
            //
            //
            $condition = buildCondition($tablename, $filter);
            if ( $ismedia ) {
                $type = isset( $_GET[ 'type' ] ) ? $_GET[ 'type' ] : "";
                if ( strlen( $type ) > 0 ) {
                    if ( strlen( $condition ) > 0 ) {
                        $condition .= " AND type='$type' ";
                    } else {
                        $condition = " WHERE type='$type' ";
                    }
                }
            }
            if ( $getflagged ) {
                if ( strlen( $condition ) > 0 ) {
                    $condition .= " AND flagged='1' ";
                } else {
                    $condition = " WHERE flagged='1' ";
                }
            }
            if ( $gettoppicks ) {
                if ( strlen( $condition ) > 0 ) {
                    $condition .= " AND toppick='1' ";
                } else {
                    $condition = " WHERE toppick='1' ";
                }
            }
            $command = "SELECT * FROM $tablename $condition ORDER BY $tablename.id DESC";
            $pagecount = 0;
            $pagenumber = 0;
            if ( $limit > 0 ) {
                $total = $db->count( $tablename, $condition );
                $pagecount = ceil( $total / $limit );
                $pagenumber = floor( $offset / $limit );
                 $command .= " LIMIT $limit OFFSET $offset";
            }
            

            $result	= $db->executeCommand( "$command;"  );
            $count = mysql_numrows( $result );
            $response = array();
            for ( $i = 0; $i < $count; $i++ ) {
                $entry = array();
                $id =  mysql_result( $result, $i, "id" );
                $entry[ "id" ] = $id;
                $entry[ "tablename" ] = $tablename;
                $entry[ "name" ] = mysql_result( $result, $i, "name" );
                $creatorid = mysql_result( $result, $i, "creator" );
                $creatorname = $db->getCreatorName( $creatorid );
                $entry[ "creator" ] = $creatorname == null ? 0 : $creatorname;
                $entry[ "creatorid" ] = $creatorid;
                $entry[ "creatoremail" ] = $db->getCreatorEmail( $creatorid );
                $thumbnail = mysql_result( $result, $i, "thumbnail" );
                if ( strlen( $thumbnail ) > 0 ) {
                    $entry[ "thumbnail" ] = $thumbnail; 
                } else {
                    $entry[ "thumbnail" ] = "getmedia.php?id=$id";
                }
                $entry[ "tags" ] = mysql_result( $result, $i, "tags" );
                $entry[ "flagged" ] = mysql_result( $result, $i, "flagged" );
                if ( $islevel ) {
                    $entry[ "place" ] = mysql_result( $result, $i, "place" );
                    $entry[ "change" ] = mysql_result( $result, $i, "action" );
                    $entry[ "published" ] = mysql_result( $result, $i, "published" );
                    $entry[ "toppick" ] = mysql_result( $result, $i, "toppick" );
                    $entry[ "json" ] = mysql_result( $result, $i, "json" );
                }
                $response[ $i ] = $entry;
            }
            //
            //
            //
            header( "Cache-Control: no-store, no-cache, must-revalidate" ); // HTTP/1.1
            header( "Cache-Control: post-check=0, pre-check=0", FALSE );
            header( "Pragma: no-cache" ); // HTTP/1.0
            header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
            header('Content-type: application/json');
            $list = array( "pagecount" => $pagecount, "pagenumber" => $pagenumber, "rows" => $response ); 
            echo json_encode($list);
        } catch( Exception $e ) {
            echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
        }
    } else {
        echo '{ "status" : "FAILED", "message" : "invalid method" }';
    }
    function buildCondition( $tablename, $filter ) {
        $join = "";
        $conditions =  "";
        if ( strlen( $filter ) > 0 ) {
            $join = " INNER JOIN creator ON creator.id = $tablename.creator ";
            $conditions .= "WHERE ( creator.name LIKE '%$filter%' OR $tablename.tags LIKE '%$filter%' OR $tablename.name LIKE '%$filter%' ) "; 
       }
       return $join . $conditions;
    }
?>
