<?php
    //
    // validate session
    //
    require_once( "session.php" );
    if ( !validatesession() ) {
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
            $filter     = isset( $_GET[ 'filter' ] ) ? $_GET[ 'filter' ] : "";
            $offset     = isset( $_GET[ 'offset' ] ) ? $_GET[ 'offset' ] : 0;
            $limit      = isset( $_GET[ 'limit' ] ) ? $_GET[ 'limit' ] : 0;
            $pagecount = 0;
            $pagenumber = 0;
            //
            //
            //
            $response = array();
            if ( !isset($_GET[ 'name' ]) || $_GET[ 'name' ] === "all" || $_GET[ 'name' ] === "latest" ) {
                if ( $limit > 0 ) {
                    $total = $db->count( "level", buildLevelCountCondition($filter));
                    $pagecount = ceil( $total / $limit );
                    $pagenumber = floor( $offset / $limit );
                }
                //
                // get all levels
                //
                $result	= $db->getLevel( 0, 0, $filter, $offset, $limit, 0, 0, "created" );
                $count = mysql_numrows( $result );
                for ( $i = 0; $i < $count; $i++ ) {
                    $entry = array();
                    
                    $levelid =  mysql_result( $result, $i, "id" );
                    $entry[ "id" ] = $levelid;
                    $entry[ "name" ] = mysql_result( $result, $i, "name" );
                    $entry[ "tablename" ] = "level";
                    $creatorid = mysql_result( $result, $i, "creator" );
                    $creatorname = $db->getCreatorName( $creatorid );
                    $entry[ "creator" ] = $creatorname == null ? 0 : $creatorname;
                    $entry[ "creatorid" ] = $creatorid;
                    $entry[ "thumbnail" ] = mysql_result( $result, $i, "thumbnail" );
                    $entry[ "tags" ] = mysql_result( $result, $i, "tags" );
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
                    $response[ $i ] = $entry;
                }
            } else {
                //
                //
                //
                $name = $_GET[ 'name' ];
                //
                // TODO: need to deal with offset and limit in query
                //
                $result	= $db->getArcade($name,$filter);
                $count = mysql_numrows( $result );
                if ( $limit ) {
                    $pagecount = ceil( $count / $limit );
                    $pagenumber = floor( $offset / $limit );
                    $start = $offset;
                    $end = $start + $limit;
                } else {
                    $start = 0;
                    $end = $count;
                }

                for ( $i = 0; $i < $count; $i++ ) {
                    
                    $levelid =  mysql_result( $result, $i, "id" );
                    if ( $i >= $start && $i < $end ) {
                        $entry = array();
                        $entry[ "id" ] = $levelid;
                        $entry[ "name" ] = mysql_result( $result, $i, "name" );
                        $entry[ "tablename" ] = "level";
                        $creatorid = mysql_result( $result, $i, "creator" );
                        $creatorname = $db->getCreatorName( $creatorid );
                        $entry[ "creator" ] = $creatorname == null ? 0 : $creatorname;
                        $entry[ "creatorid" ] = $creatorid;
                        $entry[ "thumbnail" ] = mysql_result( $result, $i, "thumbnail" );
                        $entry[ "tags" ] = mysql_result( $result, $i, "tags" );
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
                        $response[ $i ] = $entry;
                    }
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
            $list = array( "pagecount" => $pagecount, "pagenumber" => $pagenumber, "rows" => $response ); 
            echo json_encode($list);
        } catch( Exception $e ) {
            echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
        }
    } else {
        echo '{ "status" : "FAILED", "message" : "invalid method" }';
    }

    function buildLevelCountCondition( $filter ) {
        $conditions =  " WHERE published='1' AND level.flagged='0' ";
        $join = "";
        if ( strlen( $filter ) > 0 ) {
            $join =  " INNER JOIN creator ON creator.id = level.creator ";
            $conditions .= " AND ( creator.name LIKE '%$filter%' OR level.tags LIKE '%$filter%' OR level.name LIKE '%$filter%' ) "; 
        }
        return $join . $conditions;
    }
?>
