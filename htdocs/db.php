<?php
class DBConnection {
        
        protected $db = 0;
        
        public function connect() {
        //
        // TODO: export this to include file
        //
                $this->db = mysql_pconnect( "localhost", "playsouthend", "southendplay101" );
                $this->dieIfNotConnected();
                mysql_select_db( "playsouthend-db", $this->db );
        }
        
        public function isConnected() {
                return $this->db;
        }
        private function dieIfNotConnected() {
                if ( !$this->isConnected() ) die( "No connection to database" );                
        }
        
        public function checkError() {
        	$error = mysql_error();
        	if ( $error != "" ) {
        		throw new Exception( $error );
        	}
        }
        
        public function executeCommand( $command ) {
            // check db connection
            $this->dieIfNotConnected();
            $result = mysql_query($command, $this->db);
            $this->checkError();
            return $result;
        }

		public function count($table,$condition) {
			// check db connection
			$this->dieIfNotConnected();
			// build query
			$query = "SELECT COUNT(*) FROM $table $condition;";
			$result = mysql_query($query, $this->db);
			$rows = mysql_fetch_array($result);
			return $rows[ 0 ];
		}

        public function createaccount(  $creatorname, $email, $password ) {
                // check db connection
                $this->dieIfNotConnected();                
                // create account entry
                $query = "INSERT INTO creator ( name, email, password ) VALUES ('$creatorname','$email','$password')";
                mysql_query($query, $this->db);
                return mysql_insert_id($this->db);                      
        }

        public function updateaccountpassword( $creatorid, $oldpassword, $newpassword ) {
                // check db connection
                $this->dieIfNotConnected();  
                // validate old password
                $query = "SELECT password FROM creator WHERE id='$creatorid' AND password='$oldpassword';";  
                $result = mysql_query($query, $this->db);
                if ( mysql_numrows( $result ) > 0 ) {       
                    // update account entry
                    $query = "UPDATE creator SET password='$newpassword' WHERE id='$creatorid';";
                    mysql_query($query, $this->db);
                    $this->checkError();    
                } else {
                    throw new Exception( "Unable to update profile, invalid old password!" );
                }                 
        }

        public function updateaccountprofile(  $creatorid, $creatorname, $creatorthumbnail ) {
                // check db connection
                $this->dieIfNotConnected();                
                // update account entry
                $query = "UPDATE creator SET name='$creatorname', thumbnail='$creatorthumbnail' WHERE id='$creatorid';";
                mysql_query($query, $this->db);
                $this->checkError();                      
        }


        public function emailExists( $email ) {
                // check db connection
                $this->dieIfNotConnected();
                $query = "SELECT * FROM creator WHERE email='$email';";
                $result = mysql_query($query, $this->db);
                return $result && mysql_numrows($result) > 0;
        }       

        public function creatorExists( $creatorname ) {
                // check db connection
                $this->dieIfNotConnected();
                $query = "SELECT * FROM creator WHERE name='$creatorname';";
                $result = mysql_query($query, $this->db);
                return $result && mysql_numrows($result) > 0;
        }       

        public function verifyCreator( $id ) {
            $this->dieIfNotConnected();
            //
            //
            //
            $query = "UPDATE creator SET verified='1' WHERE id='$id'";
            mysql_query($query, $this->db);
            $this->checkError();
        }

        public function validateCreator( $email, $password ) {
                $this->dieIfNotConnected();
                $id = 0;
                $query = "SELECT * FROM creator WHERE email='$email';";
                $result = $this->getCreatorWithEmail( $email );
                if ( $result && mysql_numrows($result) > 0 ) {
                        $userpassword = mysql_result( $result, 0, "password" );
                        if ( strcmp( $password, $userpassword ) == 0 ) {
                                $id = mysql_result( $result, 0, "id" );
                        }
                }
                $this->checkError();
                return $id;
        }

        public function getCreatorWithEmail( $email ) {
                $this->dieIfNotConnected();
                $query = "SELECT * FROM creator WHERE email='$email';";
                $result = mysql_query($query, $this->db);
                return $result;
        }

        public function getCreatorName( $id ) {
                // check db connection
                $this->dieIfNotConnected();
                $query = "SELECT * FROM creator WHERE id='$id';";
                $result = mysql_query($query, $this->db);
                return $result && mysql_numrows($result) > 0 ? mysql_result( $result, 0, "name" ) : null;
        } 
        
        public function getCreatorEmail( $id ) {
                // check db connection
                $this->dieIfNotConnected();
                $query = "SELECT * FROM creator WHERE id='$id';";
                $result = mysql_query($query, $this->db);
                return $result && mysql_numrows($result) > 0 ? mysql_result( $result, 0, "email" ) : null;
        } 
        
        public function getCreator( $id, $filter="", $offset=0, $limit=0, $orderby="" ) {
            $this->dieIfNotConnected();
            if ( $id != 0 ) {
                $query = "SELECT * FROM creator WHERE id='$id';";
            } else {
                $query = "SELECT * FROM creator";
                if ( $orderby === "maker" ) {
                    $query = "SET @rank=0;";
                    mysql_query($query, $this->db);
                    $query = "SELECT creator.*, SUM( rating.score ) AS totalscore, ( @rank:=@rank + 1 ) AS rank, ( SELECT COUNT(*) FROM creator ) AS total FROM creator";
                    $query .= " INNER JOIN rating ON creator.id = rating.targetid WHERE rating.tablename = 'creator'";
                    $query .= " GROUP BY creator.id ORDER BY totalscore DESC";
                    if ( $limit ) {
                        $query .= " LIMIT $limit OFFSET $offset";
                    } 
                    $result = mysql_query("$query;", $this->db);
                    $this->checkError();  
                    return $result;
                } else if ( $orderby === "player" ) {
                    $query = "SET @rank=0;";
                    mysql_query($query, $this->db);
                    $query = "SELECT creator.*, SUM( score.score ) AS totalscore, ( @rank:=@rank + 1 ) AS rank, ( SELECT COUNT(*) FROM creator ) AS total FROM creator";
                    $query .= " INNER JOIN score ON creator.id = score.creatorid"; 
                    $query .= " GROUP BY creator.id ORDER BY totalscore DESC";
                    if ( $limit ) {
                        $query .= " LIMIT $limit OFFSET $offset";
                    } 
                    //throw new Exception( $query );
                    $result = mysql_query("$query;", $this->db);
                    $this->checkError();  
                    return $result;
               } else {
                    $conditions = "";
                    if ( strlen( $filter ) > 0 ) {
                        $conditions .= " WHERE name LIKE '%$filter%' "; 
                    }
                    if ( $limit ) {        
                        $query .= "$conditions ORDER BY id DESC LIMIT $limit OFFSET $offset;";
                    } else {
                        $query .= "$conditions ORDER BY id DESC;";
                    }
                }
            }
            $result = mysql_query($query, $this->db);
            $this->checkError();
            return $result;
        }
        //
        // level
        //
  public function putLevel( $name, $place, $action, $creator, $thumbnail, $tags, $json, $published ) {
                // check db connection
                $this->dieIfNotConnected();
                
                // create account entry
                $query = "INSERT INTO level ( name, place, action, creator, thumbnail, tags, json, published ) VALUES ('$name','$place','$action','$creator','$thumbnail','$tags','$json', '$published' )";
                mysql_query($query, $this->db);
                return mysql_insert_id($this->db);      
  }
  
    public function getLevel( $id, $creator, $filter, $offset, $limit, $getflagged, $getprivate, $orderby=0 ) {
        // check db connection
        $this->dieIfNotConnected();
        //
        $query = "SELECT * FROM level";
        if ( $id != 0 ) {
            $query .= $getflagged ? " WHERE id='$id';" : " WHERE flagged='0' AND id='$id';";
        } else {
            
            $conditions = "";
            if (  $creator != 0 || strlen( $filter ) > 0 ) {
                $join = "";
                if ( $creator != 0 ) {
                    $conditions .= " level.creator='$creator'";
                }
                if ( strlen( $filter ) > 0 ) {
                    if ( $creator != 0 ) {
                        $conditions .= " AND ( level.tags LIKE '%$filter%' OR level.name LIKE '%$filter%' )";
                    } else {
                        $join = " INNER JOIN creator on level.creator = creator.id ";
                        $conditions .= "( level.tags LIKE '%$filter%' OR level.name LIKE '%$filter%' OR creator.name LIKE '%$filter%' )"; 
                    }
                }
                $conditions = $join . ( $getflagged ? " WHERE " : " WHERE level.flagged='0' AND " ) . $conditions;
                
            } else {
                $conditions = $getflagged ? "" : " WHERE flagged='0'";
            }
            if ( $getprivate > 0 ) { // view my own
                if ( strlen( $conditions ) > 0 ) {
                    $conditions .= " AND ";
                } else {
                    $conditions = " WHERE ";
                }
                $conditions .= " ( level.creator='$getprivate' OR level.published='1' )";
            } else if ( $getprivate == 0 ) {
                if ( strlen( $conditions ) > 0 ) {
                    $conditions .= " AND ";
                } else {
                    $conditions = " WHERE ";
                }
                $conditions .= " level.published = '1' ";
            }
            if ( $limit ) {  
                if ( $orderby === 0 ) {      
                    $query .= "$conditions ORDER BY level.id DESC LIMIT $limit OFFSET $offset;";
                } else {
                    $query .= "$conditions ORDER BY level.$orderby DESC LIMIT $limit OFFSET $offset;";
                }
            } else {
                if ( $orderby === 0 ) {  
                    $query .= "$conditions ORDER BY level.id DESC;";
                } else {
                    $query .= "$conditions ORDER BY level.$orderby DESC;";
                }
            }
        }
        $result = mysql_query($query, $this->db);
        $this->checkError();
        return $result;
    }
  
  public function deleteLevel( $id, $creator ) {
        // check db connection
        $this->dieIfNotConnected();
        // delete level
        if ( ( isset( $_SESSION['creatorrole'] ) && $_SESSION['creatorrole'] > 0 ) ) {
            $query = "DELETE FROM level WHERE id='$id';";
        } else {
            $query = "DELETE FROM level WHERE id='$id' AND creator='$creator';";
       }
        mysql_query($query, $this->db);
        $this->checkError();
  }
  
  public function updateLevel( $id, $name, $place, $action, $thumbnail, $tags, $json, $published ) {
        // check db connection
        $this->dieIfNotConnected();
        // update level data
        $query = "UPDATE level SET name='$name', place='$place', action='$action', thumbnail='$thumbnail', tags='$tags', json='$json', published='$published', created=NOW() WHERE id='$id';";
        mysql_query($query, $this->db);
        $this->checkError();
  }
  
  public function putTopPick( $id, $toppick ) {
        // check db connection
        $this->dieIfNotConnected();
        // update level toppick
        $query = "UPDATE level SET toppick='$toppick' WHERE id='$id';";
        mysql_query($query, $this->db);
        $this->checkError();

  }

   public function levelExistsForCreator( $id, $creator ) {
        // check db connection
        $this->dieIfNotConnected();
        //
        $query = "SELECT id FROM level WHERE id='$id' AND creator='$creator';";
        $result = mysql_query($query, $this->db);
        return mysql_numrows($result) > 0;
  }

  public function getUniqueNameForLevel( $id, $name ) {
        // check db connection
        $this->dieIfNotConnected();
        //
        // get numeric prefix ( if there is one )
        //
        //
        $index = 0;
        $newname = $name;
        while( true ) {
            $query = "SELECT * FROM level WHERE name='$newname';";
            $result = mysql_query($query, $this->db);
            if ( mysql_numrows($result) > 0 && mysql_result( $result, 0, "id" ) != $id ) {
                $newname .= " Copy";
            } else {
                return $newname;
            }
        }
  }
  public function getLevelName( $id ) {
        // check db connection
        $this->dieIfNotConnected();
        //
        $query = "SELECT name FROM level WHERE id='$id';";
        $result = mysql_query($query, $this->db);
        $this->checkError();

        if ( mysql_numrows($result) > 0 ) {
            return mysql_result( $result, 0, "name" );
        }
        return "";
  }

  public function getLevelCreator( $id ) {
        // check db connection
        $this->dieIfNotConnected();
        //
        $query = "SELECT creator FROM level WHERE id='$id';";
        $result = mysql_query($query, $this->db);
        $this->checkError();

        if ( mysql_numrows($result) > 0 ) {
            return mysql_result( $result, 0, "creator" );
        }
        return 0;
  }

  public function getLevelCreatorName( $id ) {
        // check db connection
        $this->dieIfNotConnected();
        //
        $query = "SELECT creator.name FROM level INNER JOIN creator on level.creator = creator.id WHERE level.id='$id';";
        $result = mysql_query($query, $this->db);
        $this->checkError();
        if ( mysql_numrows($result) > 0 ) {
            return mysql_result( $result, 0, "creator.name" );
        }
        return "";
  }
  //
  // media
  //
  public function putMedia( $name, $creator, $path, $type, $tags, $thumbnail ) {
                // check db connection
                $this->dieIfNotConnected();
                
                // create account entry
                $query = "INSERT INTO media ( name, creator, path, type, tags, thumbnail ) VALUES ('$name','$creator','$path', '$type', '$tags', '$thumbnail' );";
                mysql_query($query, $this->db);
                
                $this->checkError();
                
                return mysql_insert_id($this->db);      
  }
  public function updateMedia( $id, $name, $creator, $path, $type, $tags, $thumbnail ) {
                // check db connection
                $this->dieIfNotConnected();
                
                // create account entry
                $query = "UPDATE media SET name= '$name', creator='$creator', path='$path', type='$type', tags='$tags', thumbnail='$thumbnail' WHERE id='$id';";
                mysql_query($query, $this->db);
                
                $this->checkError();
  }
   public function mediaExistsForCreator( $id, $creator ) {
        // check db connection
        $this->dieIfNotConnected();
        //
        $query = "SELECT * FROM media WHERE id='$id' AND creator='$creator';";
        $result = mysql_query($query, $this->db);
        return mysql_numrows($result) > 0;
  }
    public function getCreatorForMedia( $id ) {
        // check db connection
        $this->dieIfNotConnected();
        //
        $query = "SELECT creator FROM media WHERE id='$id';";
        $result = mysql_query($query, $this->db);
        if ( mysql_numrows($result) > 0 ) {
            return mysql_result($result,0,'creator');
        }
        return 0;
    }
    public function getMedia( $id, $type, $creator, $filter, $offset, $limit, $getflagged ) {
        // check db connection
        $this->dieIfNotConnected();
        //
        if ( $id != 0 ) {
            $query = "SELECT * FROM media WHERE id='$id';";
        } else {
            $query = "SELECT * FROM media";
            $conditions = "";
            if (  strlen( $type ) > 0 || $creator != 0 || strlen( $filter ) > 0 ) {
                $join = "";
                if ( strlen( $type ) > 0 ) {
                    $conditions .= " type='$type'";
                }
                if ( $creator != 0 ) {
                    if ( strlen( $conditions ) > 0 ) {
                        $conditions .= " AND ";
                    }
                    $conditions .= " creator='$creator'";
                }
                if ( strlen( $filter ) > 0 ) {
                    if ( strlen( $conditions ) > 0 ) {
                        $conditions .= " AND ";
                    }
                    if ( $creator != 0 ) {
                        $conditions .= " ( tags LIKE '%$filter%' OR name LIKE '%$filter%' )"; 
                    } else {
                        $join = " INNER JOIN creator on media.creator = creator.id ";
                        $conditions .= " ( media.tags LIKE '%$filter%' OR media.name LIKE '%$filter%' OR creator.name LIKE '%$filter%' )"; 
                    }
                    
                }
                $conditions = $join . ( $getflagged ? " WHERE " : " WHERE media.flagged='0' AND " ) . $conditions;
            } else {
                $conditions = $getflagged ? " WHERE " : " WHERE media.flagged='0'";
            }

            if ( $limit ) {        
                $query .= "$conditions ORDER BY media.id DESC LIMIT $limit OFFSET $offset;";
            } else {
                $query .= "$conditions ORDER BY media.id DESC;";
            }
        }
        $result = mysql_query($query, $this->db);
        $this->checkError();
        return $result;
    }
  
  public function deleteMedia( $id, $creator ) {
        // check db connection
        $this->dieIfNotConnected();
        // delete level
        if ( ( isset( $_SESSION['creatorrole'] ) && $_SESSION['creatorrole'] > 0 ) ) {
             $query = "DELETE FROM media WHERE id='$id';";
        } else {
            $query = "DELETE FROM media WHERE id='$id' AND creator='$creator';";
        }
        mysql_query($query, $this->db);
        $this->checkError();
  }
 

  public function putRating( $category, $tablename, $targetid, $score, $comment, $creatorid ) {
      // check db connection
      $this->dieIfNotConnected();
      // check for existing entry
      $query = "SELECT id FROM rating WHERE category='$category' AND tablename='$tablename' AND targetid='$targetid' AND $creatorid='$creatorid';";
      $result = mysql_query($query, $this->db);
      if ( mysql_numrows($result) > 0 ) {
          $id = mysql_result( $result, 0, "id" );
          $query = "UPDATE rating SET score='$score' WHERE id='$id';";
      } else {
          $query = "INSERT INTO rating ( category, tablename, targetid, score, creatorid ) VALUES ( '$category', '$tablename', '$targetid', '$score', '$creatorid' );";
      }
      mysql_query($query, $this->db);
      $this->checkError(); 
      
      // add comment
      $this->putComment( $tablename, $targetid, $comment, $creatorid );

  }
  
  public function getRating( $category, $tablename, $targetid ) {
      // check db connection
      $this->dieIfNotConnected();

      // get rating
      $query = "SELECT * FROM rating WHERE category='$category' AND tablename='$tablename' AND targetid='$targetid';";
      $result = mysql_query($query, $this->db);
      $this->checkError();  
      return $result;
  }

  public function putComment( $tablename, $targetid, $comment, $creatorid ) {
      // check db connection
      $this->dieIfNotConnected();

      // add comment
      if ( strlen( $comment ) > 0 ) {
        $query = "INSERT INTO comment ( tablename, targetid, comment, creatorid ) VALUES ( '$tablename', '$targetid', '$comment', '$creatorid');";     
        mysql_query($query, $this->db);
        $this->checkError(); 
      } 
  }

  public function getComment( $tablename, $targetid ) {
      // check db connection
      $this->dieIfNotConnected();

      $query = "SELECT * FROM comment WHERE tablename='$tablename' AND targetid='$targetid';";
      $result = mysql_query($query, $this->db);
      $this->checkError();  
      return $result; 
  }

  public function putFlag( $tablename, $targetid, $flag, $comment, $creatorid ) {
      // check db connection
      $this->dieIfNotConnected();

      // update flag
      echo  $tablename . $targetid . $flag . $comment . $creatorid;
      $query = "UPDATE $tablename SET flagged='$flag' WHERE id='$targetid';";
      mysql_query($query, $this->db);
      $this->checkError();  
      
      if ( strlen( $comment ) > 0 ) {
          // add comment
          $this->putComment( $tablename, $targetid, $comment, $creatorid );
      }
  }

  public function putAudio( $name, $type, $mp3, $ogg ) {
        // check db connection
        $this->dieIfNotConnected();
                
        // create account entry
        $query = "INSERT INTO audio ( name, type, mp3, ogg ) VALUES ('$name','$type','$mp3', '$ogg');";
        mysql_query($query, $this->db);
                
        $this->checkError();
                
        return mysql_insert_id($this->db);      

  }

  public function updateAudio( $id, $name, $type, $mp3, $ogg ) {
        // check db connection
        $this->dieIfNotConnected();
                
        // update audio
        $query = "UPDATE audio SET name= '$name', type='$type', mp3='$mp3', ogg='$ogg' WHERE id='$id';";
        mysql_query($query, $this->db);
                
        $this->checkError();

  }
  public function audioExists( $id ) {
        // check db connection
        $this->dieIfNotConnected();
        //
        $query = "SELECT * FROM audio WHERE id='$id';";
        $result = mysql_query($query, $this->db);
        return mysql_numrows($result) > 0;
  }
  public function getAudio( $id, $type ) {
        // check db connection
        $this->dieIfNotConnected();

        //
        $query = "SELECT * FROM audio WHERE";
        if ( $id != 0 ) {
            $query .= " id='$id';";
        } else {
            $query .= " type='$type';";
        }
        $result = mysql_query($query, $this->db);
        $this->checkError();  
        return $result;
  }
  //
  // score handling
  //
  public function putScore( $creatorid, $levelid, $score ) {
        // check db connection
        $this->dieIfNotConnected();
                
        // create score entry
        $query = "INSERT INTO score ( creatorid, levelid, score ) VALUES ('$creatorid','$levelid','$score');";
        mysql_query($query, $this->db);
                
        $this->checkError();
                
        return mysql_insert_id($this->db);      

  }

  public function updateScore( $id, $score ) {
        // check db connection
        $this->dieIfNotConnected();
                
        // update audio
        $query = "UPDATE score SET score='$score' WHERE id='$id';";
        mysql_query($query, $this->db);
                
        $this->checkError();

  }
  public function getScore( $creatorid, $levelid ) {
        // check db connection
        $this->dieIfNotConnected();

        //
        $query = "SELECT * FROM score WHERE creatorid='$creatorid'";
        if ( $levelid != 0 ) {
            $query .= " AND levelid='$levelid';";
        } else {
            $query .= ";";
        }
        $result = mysql_query($query, $this->db);

        $this->checkError();  

        return $result;
  }
  //
  //
  //
  public function getArcade($name,$filter) {
        // check db connection
        $this->dieIfNotConnected();
        //
        //
        //
        /*
            { name: "Top pics", id: "arcade.toppics" },
            { name: "Ideas for change", id: "arcade.change" },
            { name: "Artistry", id: "arcade.artistry" },
            { name: "Fun", id: "arcade.fun" },
            { name: "Latest", id: "arcade.all" }
        */
        if ( $name === "toppicks" ) {
            //
            $query = "SELECT * FROM level WHERE toppick='1' AND flagged='0';";
            $result = mysql_query($query, $this->db);
            $this->checkError();  
            return $result;
        } else {
            $category = "";
            if ( $name === "change" ) {
                $category = "Change idea";
            } else if ( $name === "local" ) {
                $category = "Local flavour";
            } else if ( $name === "artistry" ) {
                $category = "Artistry";
            } else if ( $name === "fun" ) {
                $category = "Fun";
            }
            //
            // create temporary score table
            //
            $query = "CREATE TEMPORARY TABLE levelscore ( targetid int(10) unsigned, averagescore FLOAT );";
            mysql_query($query, $this->db);
            $this->checkError();  
            //
            // get level score averages for category
            //
            $query = "INSERT INTO levelscore ( targetid, averagescore ) SELECT targetid, AVG( score ) as averagescore FROM rating WHERE tablename='level' and category='$category' GROUP BY targetid ORDER BY averagescore;";
            mysql_query($query, $this->db);
            $this->checkError();  
            $query = "SELECT * FROM level INNER JOIN levelscore ON levelscore.targetid = level.id";
            if ( $filter !== "" ) {
                $query .= " INNER JOIN creator on level.creator = creator.id";
                $query .= " WHERE level.flagged='0' AND ( level.tags LIKE '%$filter%' OR level.name LIKE '%$filter%' OR creator.name LIKE '%$filter%' )";
            } else {
                $query .= " WHERE level.flagged='0'";
            }
            $query .= " ORDER BY levelscore.averagescore DESC;";
            $result = mysql_query($query, $this->db);
            $this->checkError(); 
            //
            // drop score table
            //
            $query = "DROP TABLE levelscore;";
            mysql_query($query, $this->db);
            $this->checkError();  
            return $result;
        }
  }
  public function addToArcade( $name, $levelid ) {
        // create score entry
        $query = "INSERT INTO arcade ( name, levelid ) VALUES ('$name','$levelid');";
        mysql_query($query, $this->db);
                
        $this->checkError();
                
        return mysql_insert_id($this->db);      

  }
  public function removeFromArcade( $name, $levelid ) {
        $query = "DELETE * FROM arcade WHERE name='$name' AND id='$levelid';";
        mysql_query($query, $this->db);
        $this->checkError();
  }

  public function addAttribution( $copyid, $originalid ) {
        // check db connection
        $this->dieIfNotConnected();
        // build query
        $query = "INSERT INTO attribution ( copyid, originalid ) VALUES ( '$copyid', '$originalid' );";
        // execute
        mysql_query($query, $this->db);
        //
        $this->checkError();
        //
        return mysql_insert_id($this->db);      
  }

  public function getAttribution( $copyid ) {
        // check db connection
        $this->dieIfNotConnected();
        // build query
        $query = "SELECT * FROM attribution WHERE copyid='$copyid';";
        // execute
        $result = mysql_query($query, $this->db);
        //
        $this->checkError();
        //
        return $result;
  }

 };

?>
