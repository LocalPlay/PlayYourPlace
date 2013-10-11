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
        header( 'Location: index.html' ) ;     
        exit();
    }
    try {
            //
            // connect to database
            //
            require_once( "db.php" );
            $db = new DBConnection;
            $db->connect();
            //
            // delete existing entries
            //
            $db->executeCommand( "DELETE FROM rating WHERE tablename='creator';" );
            //
            // get all creators
            //
            $creators = $db->executeCommand( "SELECT id FROM creator;" );
            $creatorcount = mysql_numrows( $creators );
            for ( $creator = 0; $creator < $creatorcount; $creator++ ) {
                //
                //
                //
                $creatorid = mysql_result( $creators, $creator, "id" );
                //
                // get creator levels
                //
                $levels = $db->executeCommand( "SELECT id FROM level WHERE creator='$creatorid';" );
                $levelcount = mysql_numrows( $levels );
                for ( $level = 0; $level < $levelcount; $level++ ) {
                    //
                    // get level id
                    //
                    $levelid = mysql_result( $levels, $level, "id" );
                    //
                    // get level ratings
                    //
                    $ratings = $db->executeCommand( "SELECT * FROM rating WHERE tablename='level' AND targetid='$levelid';" );
                    $ratingcount = mysql_numrows( $ratings );
                    for ( $rating = 0; $rating < $ratingcount; $rating++ ) {
                        //
                        //
                        //
                        $category = mysql_result( $ratings, $rating, "category" );
                        $score = mysql_result( $ratings, $rating, "score" );
                        $sourcecreatorid = mysql_result( $ratings, $rating, "creatorid" );
                        //
                        //
                        //
                        $db->putRating( $category, "creator", $creatorid, $score, "", $sourcecreatorid );
                    }
                }
            }


            echo '{ "status" : "OK", "message" : "done" }';
    } catch( Exception $e ) {
        echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
    }

?>
