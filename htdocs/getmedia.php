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
            if ( $id != 0 ) {
                $result = $db->getMedia( $id, "", 0, "", 0, 0, 1 );
                $count = mysql_numrows( $result );
                if ( $count > 0 ) {
                    $type = mysql_result( $result, 0, "type" );  
                    if ( mysql_result( $result, 0, "flagged" ) == 0 || ( isset( $_SESSION['creatorrole'] ) && $_SESSION['creatorrole'] > 0 ) ) {
                        $path = mysql_result( $result, 0, "path" );
                    } else {
                        $path = "images/flagged-$type.png";
                    }
                    $mime = "image/png";

                    $parts = explode( '.', $path );
                    $count = count($parts);
                    if ( $count > 0 ) {
                        $ext = $parts[ $count - 1 ];
                        if ( $ext == "jpg" || $ext == "jpeg" ) {
                            $mime = "image/jpeg";
                        } else if ( $ext == "gif"  ) {
                            $mime = "image/gif";
                        }
                    }

                    header("Content-type: $mime");
                    header("Location: $path");
                } else {
                    header("Content-type: image/png");
                    header("Location: images/deleted.png");
                }
            } else {
                $currentcreator = isset(  $_SESSION[ 'creatorid' ] ) ?  $_SESSION[ 'creatorid' ] : 0;
                if ( isset( $_GET[ 'mine' ] ) && $_GET[ 'mine' ] == "true" ) {
                    $creator = $currentcreator;
                } else {
                    $creator  = $id == 0 && isset( $_GET[ 'creator' ] ) ? $_GET[ 'creator' ] : 0;
                }
                $filter = $id == 0 && isset( $_GET[ 'filter' ] ) ? $_GET[ 'filter' ] : "";
                $type = isset( $_GET[ 'type' ] ) ? $_GET[ 'type' ] : "";
                $listview = isset( $_GET[ 'listview' ] ) ? $_GET[ 'listview' ] : false;
                $urlonly = isset( $_GET[ 'urlonly' ] ) ? $_GET[ 'urlonly' ] : false;

                $offset = isset( $_GET[ 'offset' ] ) ? $_GET[ 'offset' ] : 0;
                $limit = isset( $_GET[ 'limit' ] ) ? $_GET[ 'limit' ] : 0;
                $pagecount = 0;
                $pagenumber = 0;
                if ( $limit > 0 ) {
                    $total = $db->count( "media", buildMediaCountCondition($type,$creator,$filter));
                    $pagecount = ceil( $total / $limit );
                    $pagenumber = floor( $offset / $limit );
                }
      
                $result	= $db->getMedia( $id, $type, $creator, $filter, $offset, $limit, ( isset( $_SESSION['creatorrole'] ) && $_SESSION['creatorrole'] > 0 ) );
                $count = mysql_numrows( $result );
                $response = array();
                for ( $i = 0; $i < $count; $i++ ) {
                    array_push( $response, createMediaResponseFromResult( $db, $result, $i, $urlonly, $currentcreator ) );
                }
                //
                //
                //
                if ( $listview ) { // don't cache the list view
                	header( "Cache-Control: no-store, no-cache, must-revalidate" ); // HTTP/1.1
                	header( "Cache-Control: post-check=0, pre-check=0", FALSE );
                	header( "Pragma: no-cache" ); // HTTP/1.0
                	header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
                }
                header('Content-type: application/json');
                if ( $listview ) {
                    $list = array( "pagecount" => $pagecount, "pagenumber" => $pagenumber, "rows" => $response ); 
                    echo json_encode($list);
                } else {
                    echo json_encode($response);
                }
            }
        } catch( Exception $e ) {
            echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
        }
    } else {
        echo '{ "status" : "FAILED", "message" : "Invalid method" }';
    }

    function createMediaResponseFromResult( $db, $result, $i, $urlonly, $currentcreator ) {
        $mediaid =  mysql_result( $result, $i, "id" );
        if ( $urlonly ) {
            return "getmedia.php?id=$mediaid";
        } else {
            $entry = array();
            $entry[ "id" ] = $mediaid;
            $entry[ "tablename" ] = "media";
            $entry[ "name" ] = mysql_result( $result, $i, "name" );
            $creatorid = mysql_result( $result, $i, "creator" );
            $creatorname = $db->getCreatorName( $creatorid );
            $entry[ "creator" ] = $creatorname == null ? 0 : $creatorname;
            $thumbnail = mysql_result( $result, $i, "thumbnail" );
            if ( strlen( $thumbnail ) > 0 ) {
                $entry[ "thumbnail" ] = $thumbnail; 
            } else {
                $entry[ "thumbnail" ] = "getmedia.php?id=$mediaid";
            }
            $entry[ "url" ] = "getmedia.php?id=$mediaid";
            $entry[ "tags" ] = mysql_result( $result, $i, "tags" );
            if ( $currentcreator ==  $creatorid || ( isset( $_SESSION['creatorrole'] ) && $_SESSION['creatorrole'] > 0 ) ) {
                 $entry[ "candelete" ] = 1;
                 if ( ( isset( $_SESSION['creatorrole'] ) && $_SESSION['creatorrole'] > 0 ) ) {
                    $entry[ "canflag" ] = 1;
                 }
            } else {
                $entry[ "canflag" ] = 1;
            }
            return $entry;
       }

    }

    function buildMediaCountCondition( $type, $creator, $filter ) {
        $conditions = ( isset( $_SESSION['creatorrole'] ) && $_SESSION['creatorrole'] > 0 ) ? " WHERE type='$type'" : " WHERE type='$type' AND flagged='0'";
        if ( $creator > 0 ) {
            $conditions .= " AND creator='$creator'";
        }
        if ( strlen( $filter ) > 0 ) {
            $conditions .= " AND ( tags LIKE '%$filter%' OR name LIKE '%$filter%' )"; 
        }
        return $conditions;
    }

?>
