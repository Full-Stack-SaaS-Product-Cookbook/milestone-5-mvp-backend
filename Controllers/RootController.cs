using Microsoft.AspNetCore.Mvc;

namespace ReduxPlateApi.Controllers
{
    public class RootController : Controller
    {
        [HttpGet("/")]
        public ActionResult<string> Get()
        {
            return Ok("ReduxPlate API v1.0.0");
        }
    }
}
