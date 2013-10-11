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
            // add level
            //
            $id	= isset( $_GET[ 'id' ] ) ? $_GET[ 'id' ] : 0;
            if ( isset( $_GET[ 'mine' ] ) && $_GET[ 'mine' ] == "true" ) {
                $creator = $_SESSION[ 'creatorid' ];
            } else {
                $creator  = $id == 0 && isset( $_GET[ 'creator' ] ) ? $_GET[ 'creator' ] : 0;
            }
            $filter = $id == 0 && isset( $_GET[ 'filter' ] ) ? $_GET[ 'filter' ] : "";
            $listview = isset( $_GET[ 'listview' ] ) ? $_GET[ 'listview' ] : false;

            $offset = isset( $_GET[ 'offset' ] ) ? $_GET[ 'offset' ] : 0;
            $limit = isset( $_GET[ 'limit' ] ) ? $_GET[ 'limit' ] : 0;
            $pagecount = 0;
            $pagenumber = 0;
            $getprivate = ( isset( $_SESSION['creatorrole'] ) && $_SESSION['creatorrole'] > 0 ) ? -1 : ( isset( $_SESSION['creatorid'] ) ? $_SESSION['creatorid'] : 0 ); 
            if ( $limit > 0 ) {
                $total = $db->count( "level", buildLevelCountCondition($creator,$filter,$getprivate));
                $pagecount = ceil( $total / $limit );
                $pagenumber = floor( $offset / $limit );
            }
            //
            // check for mobile
            //
            $useragent = $_SERVER['HTTP_USER_AGENT'];
            $ios = stripos( $useragent, "ipod" ) || stripos( $useragent, "iphone" ) || stripos( $useragent, "ipad" );
            //
            //
            //
            $result	= $db->getLevel( $id, $creator, $filter, $offset, $limit, ( isset( $_SESSION['creatorrole'] ) && $_SESSION['creatorrole'] > 0 ), $getprivate );
            $count = mysql_numrows( $result );
            if ( $id != 0 && $count == 0 ) {
                throw new Exception( "Unable to find level $id" );
            }
            $response = array();
            for ( $i = 0; $i < $count; $i++ ) {
                $entry = array();
                $levelid =  mysql_result( $result, $i, "id" );
                $entry[ "id" ] = $levelid;
                $entry[ "tablename" ] = "level";
                $entry[ "name" ] = mysql_result( $result, $i, "name" );
                $entry[ "place" ] = mysql_result( $result, $i, "place" );
                $entry[ "change" ] = mysql_result( $result, $i, "action" );
                $creatorid = mysql_result( $result, $i, "creator" );
                $creatorname = $db->getCreatorName( $creatorid );
                $entry[ "creator" ] = $creatorname == null ? 0 : $creatorname;
                $entry[ "creatorid" ] = $creatorid;
                $entry[ "thumbnail" ] = mysql_result( $result, $i, "thumbnail" );
                $entry[ "tags" ] = mysql_result( $result, $i, "tags" );
                $entry[ "published" ] = mysql_result( $result, $i, "published" );
                if ( $listview ) {
                    if ( $ios ) {
                      $entry[ "showcommand" ] = "playmobile.php?id=$levelid";
                    } else {
                      $entry[ "showcommand" ] = "play.php?id=$levelid";
                    }
                    
                    if ( isset( $_SESSION[ 'creatorid' ] ) && ( $creatorid == $_SESSION[ 'creatorid' ] || ( isset( $_SESSION['creatorrole'] ) && $_SESSION['creatorrole'] > 0 ) ) ) {
                        $entry[ "editcommand" ] = "edit.php?id=$levelid";
                        $entry[ "deletecommand" ] = "deletelevel.php?id=$levelid";
                        $entry[ "candelete" ] = 1;
                        if ( ( isset( $_SESSION['creatorrole'] ) && $_SESSION['creatorrole'] > 0 ) ) {
                            $entry[ "canflag" ] = 1;
                        }
                    } else {
                        $entry[ "canflag" ] = 1;
                    }
                    
                } else {
                    $entry[ "json" ] = mysql_result( $result, $i, "json" );
                }
                //
                // get attribution ( if there is any )
                //
                $levelattribution = $db->getAttribution($levelid);
                if ( mysql_numrows( $levelattribution ) > 0 ) {
                    $originalid = mysql_result( $levelattribution, 0, "originalid" );
                    $originalname = $db->getLevelName( $originalid );
                    $originalcreatorid = $db->getLevelCreator( $originalid );
                    $originalcreator = $db->getCreatorName( $originalcreatorid );
                    if ( strlen( $originalname ) > 0 && strlen( $originalcreator ) > 0 ) {
                        $attribution = array();
                        $attribution[ "originalid" ] = $originalid;
                        $attribution[ "originalname" ] = $originalname;
                        $attribution[ "originalcreatorid" ] = $originalcreatorid;
                        $attribution[ "originalcreator" ] = $originalcreator;
                        $entry[ "attribution" ] = $attribution;
                    }
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
        echo '{ "status" : "FAILED", "message" : "invalid method" }';
    }

    function buildLevelCountCondition( $creator, $filter, $getprivate ) {
        $join = "";
        $conditions =  "";
        if ( $creator > 0 ) {
            $conditions .= "level.creator='$creator'";
        }
        if ( strlen( $filter ) > 0 ) {
            if ( strlen( $conditions ) > 0 ) {
                $conditions .= " AND ";
            }
            $join = " INNER JOIN creator ON creator.id = level.creator ";
            $conditions .= " ( creator.name LIKE '%$filter%' OR level.tags LIKE '%$filter%' OR level.name LIKE '%$filter%' ) "; 
        }
        if ( $getprivate > 0 ) { // view my own
            if ( strlen( $conditions ) > 0 ) {
                $conditions .= " AND ";
            }
            $conditions .= " ( level.creator = '$getprivate' OR level.published = '1' ) ";
        } else if ( $getprivate == 0 ) {
            if ( strlen( $conditions ) > 0 ) {
                $conditions .= " AND ";
            }
            $conditions .= " level.published='1' ";
        }
        if( isset( $_SESSION['creatorrole'] ) && $_SESSION['creatorrole'] > 0 ) {
            if ( strlen( $conditions ) > 0 ) {
                $conditions = " WHERE $conditions";
            } 
        } else {
            if ( strlen( $conditions ) > 0 ) {
                $conditions = " WHERE level.flagged='0' AND $conditions";
            } else {
                $conditions = " WHERE level.flagged='0'";
            } 
        }
        return $join . $conditions;
    }
?>
