using System.Threading.Tasks;
using ReduxPlateApi.Models;

namespace ReduxPlateApi.Infrastructure.Services
{
    public interface ICodeGeneratorService
    {
        Task<Generated> Generate(GeneratorOptions generatorOptions);
    }
}
