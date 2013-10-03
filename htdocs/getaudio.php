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
      // get rating
      //
      $id       = isset( $_GET[ 'id' ] ) ? $_GET[ 'id' ] : 0;
      $type     = isset( $_GET[ 'type' ] ) ? $_GET[ 'type' ] : "none";
      $result   = $db->getAudio( $id, $type );
      $count = mysql_numrows( $result );
      if ( $count > 0 ) {
        $audio = null;
        if ( $id !== 0 ) {
            $audio = array( "id" => $id, "name" => mysql_result( $result, 0, 'name' ), "type" => mysql_result( $result, 0, 'type' ), "mp3" => mysql_result( $result, 0, 'mp3' ), "ogg" => mysql_result( $result, 0, 'ogg' ) ); 
        } else {
            $audio = array();
            for ( $i = 0; $i < $count; $i++ ) {
                $entry = array( "id" => mysql_result( $result, $i, 'id' ), "name" => mysql_result( $result, $i, 'name' ), "type" => mysql_result( $result, $i, 'type' ), "mp3" => mysql_result( $result, $i, 'mp3' ), "ogg" => mysql_result( $result, $i, 'ogg' ) );
                array_push( $audio, $entry );
            }
        }
        $json = json_encode( $audio );
        echo '{ "status" : "OK", "message" : { "data" : ' . $json . ' } }';
      } else {
        echo '{ "status" : "FAILED", "message" : "No entry" }';
      }
			
    } catch( Exception $e ) {
      echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
    }
  } else {
    echo '{ "status" : "FAILED", "message" : "Invalid method" }';
  }
?>
