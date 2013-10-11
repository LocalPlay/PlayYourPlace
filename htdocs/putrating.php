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
    echo '{ "status" : "FAILED", "message" : "Please login to vote." }';
    exit();
  }
  if ($_POST) {
    try {
      //
      // connect to database
      //
      require_once( "db.php" );
      $db = new DBConnection;
      $db->connect();
      //
      // add rating
      //
      $category	    = $_POST[ 'category' ];
      $tablename	= $_POST[ 'tablename' ];
      $targetid	    = $_POST[ 'targetid' ];
      $score        = $_POST[ 'score' ];
      $comment      = $_POST[ 'comment' ];
      $db->putRating( $category, $tablename, $targetid, $score, $comment, $_SESSION[ 'creatorid' ] );
      //
      // TODO: for level rating need to add rating for maker
      //
      if ( $tablename === "level" ) {
            $creatorid = $db->getLevelCreator($targetid);
            $db->putRating( $category, "creator", $creatorid, $score, $comment, $_SESSION[ 'creatorid' ] );
      }
      echo '{ "status" : "OK", "message" : "Vote registered" }';
    } catch( Exception $e ) {
      echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
    }
  } else {
    echo '{ "status" : "FAILED", "message" : "Invalid method" }';
  }
?>
