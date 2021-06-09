import IGenerated from "./interfaces/IGenerated";
import CodeGeneratorService from "./services/CodeGeneratorService";

module.exports = (
  callback: (_: null, result: IGenerated) => void,
  stateCode: string
) => {
  try {
    const codeGeneratorService = new CodeGeneratorService(stateCode);
    const sourceFiles = codeGeneratorService.getSourceFiles();
    const generated = {
      files: sourceFiles.map((sourceFile) => {
        return {
          fileLabel: sourceFile.getBaseName(),
          code: sourceFile.getFullText(),
        };
      }),
    };
    callback(null, generated);
  } catch (error) {
    throw error.message;
  }
};
