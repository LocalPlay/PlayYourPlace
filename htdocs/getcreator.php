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
    if ( !validatesession() ) {
        //header( 'Location: index.html' ) ;
        //exit();
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
            $id	= isset( $_GET[ 'id' ] ) ? $_GET[ 'id' ] : 0;
            $response = array();
            $listview = isset( $_GET[ 'listview' ] ) ? $_GET[ 'listview' ] : false;
            if ( $id != 0 ) {
                $result = $db->getCreator( $id, "", 0, 0 );
                $count = mysql_numrows( $result );
                if ( $count > 0 ) {
                    $response[ "id" ] = $id;
                    $response[ "name" ] = mysql_result( $result, 0, "name" );
                    $response[ "tags" ] = "";
                    $thumbnail = mysql_result( $result, 0, "thumbnail" );
                    $response[ "thumbnail" ] = $thumbnail ? $thumbnail : "images/usericon.png";
                    $response[ "created" ] = date( "d M Y", strtotime( mysql_result( $result, 0, "created" ) ) );
                }  else {
                  throw new Exception( "Invalid user id" );
                }
            } else {
                $orderby = isset( $_GET[ 'orderby' ] ) ? $_GET[ 'orderby' ] : ""; // maker or player or ""
                $filter = $id == 0 && isset( $_GET[ 'filter' ] ) ? $_GET[ 'filter' ] : "";
                $urlonly = isset( $_GET[ 'urlonly' ] ) ? $_GET[ 'urlonly' ] : false;

                $offset = isset( $_GET[ 'offset' ] ) ? $_GET[ 'offset' ] : 0;
                $limit = isset( $_GET[ 'limit' ] ) ? $_GET[ 'limit' ] : 0;
                $pagecount = 0;
                $pagenumber = 0;
                if ( $limit > 0 ) {
                    if ( strlen( $orderby ) > 0 ) {
                        $query = "SELECT count(*) FROM creator";
                        if ( $orderby === "maker" ) {
                            $query .= " INNER JOIN rating ON creator.id = rating.targetid WHERE rating.tablename = 'creator'";
                            $query .= " GROUP BY creator.id";
                        } else if ( $orderby === "player" ) {
                            $query .= " INNER JOIN score ON creator.id = score.creatorid"; 
                            $query .= " GROUP BY creator.id";
                        }
                        $counts = $db->executeCommand( $query );
                        $total = mysql_numrows( $counts );
                    } else if ( strlen( $filter ) > 0 ) {
                        $total = $db->count( "creator", " WHERE name LIKE '%$filter%'");
                    } else {
                        $total = $db->count( "creator", "");
                    }
                    $pagecount = ceil( $total / $limit );
                    $pagenumber = floor( $offset / $limit );
                }
      
                $result	= $db->getCreator( $id, $filter, $offset, $limit, $orderby );
                $count = mysql_numrows( $result );
                $response = array();
                for ( $i = 0; $i < $count; $i++ ) {
                    $entry = array();
                    $entry[ "id" ] = mysql_result( $result, $i, "id" );;
                    $entry[ "name" ] = mysql_result( $result, $i, "name" );
                    $entry[ "tags" ] = "";
                    $thumbnail = mysql_result( $result, $i, "thumbnail" );
                    $entry[ "thumbnail" ] = $thumbnail  ? $thumbnail : "images/usericon.png";
                    $entry[ "created" ] = date( "d M Y", strtotime( mysql_result( $result, $i, "created" ) ) );
                    if ( $orderby !== "" ) {
                        $ranking = array();
                        $ranking[ "rank" ] = $offset + $i + 1;//mysql_result( $result, $i, "rank" );
                        $ranking[ "total" ] = mysql_result( $result, $i, "total" );
                        $ranking[ "score" ] = mysql_result( $result, $i, "totalscore" );
                        $entry[ $orderby . "ranking" ] = $ranking;
                    }
                    $response[ $i ] = $entry;
                }
            }
            //
            //
            //
            header( "Cache-Control: no-store, no-cache, must-revalidate" ); // HTTP/1.1
            header( "Cache-Control: post-check=0, pre-check=0", FALSE );
            header( "Pragma: no-cache" ); // HTTP/1.0
            header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
            header('Content-type: application/json');
            if ( $listview ) {
                $list = array( "pagecount" => $pagecount, "pagenumber" => $pagenumber, "rows" => $response ); 
                echo json_encode($list);
            } else {
                echo json_encode($response);
            }
        } catch( Exception $e ) {
            echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
        }
    } else {
        echo '{ "status" : "FAILED", "message" : "Invalid method" }';
    }

?>
