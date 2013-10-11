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
    $method = $_SERVER[ 'REQUEST_METHOD' ];
    if ( strcmp( $method, 'GET' ) == 0 ) {
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
            $filter = isset( $_GET[ 'filter' ] ) ? $_GET[ 'filter' ] : "";
            $offset = isset( $_GET[ 'offset' ] ) ? $_GET[ 'offset' ] : 0;
            $limit = isset( $_GET[ 'limit' ] ) ? $_GET[ 'limit' ] : 0;
            $getflagged = isset($_GET[ 'flagged' ]) ? $_GET[ 'flagged' ] : 0;
            $getblocked = isset($_GET[ 'blocked' ]) ? $_GET[ 'blocked' ] : 0;
            //
            //
            //
            $condition = buildCondition($filter);
            if ( $getflagged ) {
                if ( strlen( $condition ) > 0 ) {
                    $condition .= " AND flagged='1' ";
                } else {
                    $condition = " WHERE flagged='1' ";
                }
            }
            if ( $getblocked ) {
                if ( strlen( $condition ) > 0 ) {
                    $condition .= " AND blocked='1' ";
                } else {
                    $condition = " WHERE blocked='1' ";
                }
            }
            $command = "SELECT * FROM creator $condition ORDER BY creator.id DESC";
            $pagecount = 0;
            $pagenumber = 0;
            if ( $limit > 0 ) {
                $total = $db->count( "creator", $condition );
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
                $entry[ "tablename" ] = "creator";
                $entry[ "name" ] = mysql_result( $result, $i, "name" );
                $entry[ "email" ] = mysql_result( $result, $i, "email" );
                $thumbnail = mysql_result( $result, $i, "thumbnail" );
                $entry[ "thumbnail" ] = $thumbnail ? $thumbnail : "images/usericon.png";
                $entry[ "created" ] = date( "d M Y", strtotime( mysql_result( $result, 0, "created" ) ) );
                $entry[ "flagged" ] = mysql_result( $result, $i, "flagged" );
                $entry[ "verified" ] = mysql_result( $result, $i, "verified" );
                $entry[ "blocked" ] = mysql_result( $result, $i, "blocked" );
                $entry[ "role" ] = mysql_result( $result, $i, "role" );

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
        echo '{ "status" : "FAILED", "message" : "invalid method : ' . $_SERVER[ 'REQUEST_METHOD' ] . '" }';
    }
    function buildCondition( $filter ) {
        $conditions =  "";
        if ( strlen( $filter ) > 0 ) {
            $conditions .= "WHERE ( creator.name LIKE '%$filter%' ) "; 
        }
        if ( strlen( $conditions ) > 0 ) {
            $conditions .= " AND creator.id != " . $_SESSION['creatorid'] . " ";
        } else {
            $conditions .= "WHERE creator.id != " . $_SESSION['creatorid'] . " ";
        }
       return $conditions;
    }
?>
