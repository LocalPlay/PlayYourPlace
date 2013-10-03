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
