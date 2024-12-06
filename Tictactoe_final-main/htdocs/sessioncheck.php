<?PHP
require "dbsession.php";

//Let's see if we already have a session, if we do, return that, if not... faaaail :-)
function sessionUid()
{
	if (!array_key_exists("uid", $_SESSION))
	{
		$ret = [];
		$ret["success"] = false;
		$ret["message"] = "No logged in session";
		$ret["mid"] = 1;
		echo json_encode($ret);
		return null;
	}
	if ($_SESSION["uid"] == null)
	{
		$ret = [];
		$ret["success"] = false;
		$ret["message"] = "No logged in session";
		$ret["mid"] = 1;
		echo json_encode($ret);
		return null;
	}
	else
	{
		$uid = $_SESSION["uid"];		
		return $uid;
	}
}
?>