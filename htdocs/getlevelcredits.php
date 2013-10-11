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
            $levelid = $_GET[ 'id' ];
            //
            // get level
            //
            $result = $db->executeCommand( "SELECT * FROM level WHERE id='$levelid';" );
            if ( mysql_numrows( $result ) > 0 ) {
                $response = array();
                //
                // get level credits
                //
                $response[ "name" ] = mysql_result( $result, 0, "name" );
                $response[ "creatorid" ] = mysql_result( $result, 0, "creator" ); 
                $response[ "creator" ] = $db->getCreatorName( $response[ "creatorid" ] );
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
                        $response[ "attribution" ] = $attribution;
                    }
                }
                //
                // decode JSON
                //
                $json = json_decode( stripslashes(mysql_result( $result, 0, "json" )), true );
                //
                // get backgrounds
                //
                $backgroundimages = $json[ "background" ][ "images" ];
                $count = count($backgroundimages);
                if ( $count > 0 ) {
                    $backgrounds = array();
                    for ( $i = 0; $i < $count; $i++ ) {
                        $entry = createMediaEntry( $db, $backgroundimages[ $i ] );
                        if ( isset( $entry[ "id" ] ) ) {
                            $entry[ "type" ] = "object";
                            $backgrounds[] = $entry;
                        }
                    }
                    if ( count($backgrounds) > 0 ) {
                        $entry = array();
                        $entry[ "background" ] = $backgrounds;
                        $response[ "backgrounds" ] = $entry;
                    }
                }
                //
                // get avatar
                //
                $avatarimage = $json[ "avatar" ][ "image" ];
                if ( $avatarimage ) {
                    $entry = createMediaEntry($db,$avatarimage);
                    if ( isset( $entry[ "id" ] ) ) {
                        $entry[ "type" ] = "object";
                        $response[ "avatar" ] = $entry;
                    }
                }
                //
                // get other media credits
                //
                $types = array( "platform", "obstacle", "pickup", "goal", "prop" );
                $typecount = count( $types );
                for ( $type = 0; $type < $typecount; $type++ ) {
                    $typeinstances =  $json[ $types[ $type ] . "s" ];
                    $count = count( $typeinstances );
                    if ( $count > 0 ) {
                        $typeentries = array();
                        $exclude = array();
                        for ( $i = 0; $i < $count; $i++ ) {
                            $entry = createMediaEntry( $db, $typeinstances[ $i ][ $types[ $type ] ][ "image" ] );
                            if ( isset( $entry[ "id" ] ) && array_search( $entry[ "id" ], $exclude ) === FALSE) {
                                $exclude[] = $entry[ "id" ];
                                $entry[ "type" ] = "object";
                                $typeentries[] = $entry;
                            }
                        }
                        if ( count($typeentries) > 0 ) {
                            $entry = array();
                            $entry[ $types[ $type ] ] = $typeentries;
                            $response[ $types[ $type ] . "s" ] = $entry;
                        }
                    } 
                }
                
                echo json_encode($response);
            } else {
                throw new Exception( "Unable to find level!" );
            }
        } catch( Exception $e ) {
            echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
        }
    } else {
        echo '{ "status" : "FAILED", "message" : "Invalid method" }';
    }

    function createMediaEntry( $db, $url ) {
        $entry = array();
        $entry[ "image" ] = $url;
        $parts = explode( "=", $url );
        if ( count( $parts ) > 1 ) {
            $id = $parts[1];
            $entry[ "id" ] = $id;
            $result = $db->getMedia( $id, "", 0, "", 0, 0, 0 );
            if ( mysql_numrows($result) > 0 ) {
                $entry[ "name" ] = mysql_result( $result, 0, "name" );
                $creatorid = mysql_result( $result, 0, "creator" );
                $entry[ "creatorid" ] =  $creatorid;
                $entry[ "creator" ] = $db->getCreatorName( $creatorid );
                return $entry;
            }
        }
        $entry[ "creatorid" ] =  -1;
        $entry[ "creator" ] = "Unknown";
        return $entry;
    }
?>
