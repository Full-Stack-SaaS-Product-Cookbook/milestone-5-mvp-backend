using System;
using System.IO;
using System.Threading.Tasks;
using Jering.Javascript.NodeJS;
using Microsoft.Extensions.FileProviders;
using ReduxPlateApi.Infrastructure.Services;
using ReduxPlateApi.Models;

namespace ReduxPlateApi.Services
{
    public class CodeGeneratorService : ICodeGeneratorService
    {
        private readonly INodeJSService nodeJSService;

        public CodeGeneratorService(INodeJSService nodeJSService)
        {
            this.nodeJSService = nodeJSService;
        }

        public async Task<Generated> Generate(GeneratorOptions generatorOptions)
        {
            try
            {
                var physicalFileProvider = new PhysicalFileProvider(Directory.GetCurrentDirectory());
                var filePath = Path.Combine(physicalFileProvider.Root, "Microservices", "reduxplate-code-generator", "dist", "index.js");
                return await nodeJSService.InvokeFromFileAsync<Generated>(filePath, args: new[] { generatorOptions.StateCode });
            } catch (Exception exception)
            {
                throw new Exception(exception.Message);
            }
        }
    }
}
