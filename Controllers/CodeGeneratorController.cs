
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ReduxPlateApi.Infrastructure.Services;
using ReduxPlateApi.Models;

namespace ReduxPlateApi.Controllers
{
    [Route("/[controller]")]
    public class CodeGeneratorController : ControllerBase
    {
        private readonly ICodeGeneratorService codeGeneratorService;

        public CodeGeneratorController(ICodeGeneratorService codeGeneratorService)
        {
            this.codeGeneratorService = codeGeneratorService;
        }

        [HttpPost]
        public async Task<ActionResult<Generated>> PostAsync([FromBody] GeneratorOptions generatorOptions)
        {
            try
            {
                var generated = await this.codeGeneratorService.Generate(generatorOptions);
                return Ok(generated);
            } catch (Exception exception)
            {
                var apiErrorMessage = new ApiErrorMessageModel
                {
                    ApiErrorMessage = exception.Message
                };
                return StatusCode(StatusCodes.Status500InternalServerError, apiErrorMessage);
            }
        }
    }
}
