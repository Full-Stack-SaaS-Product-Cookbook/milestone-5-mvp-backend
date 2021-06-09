import CodeGeneratorService from "./services/CodeGeneratorService";

const stateCode = `export interface ReduxPlateState {
    myString: string;
    myNumber: number;
}`

const codeGeneratorService = new CodeGeneratorService(stateCode)
const sourceFiles = codeGeneratorService.getSourceFiles()

sourceFiles.forEach(sourceFile => {
    console.log(`----${sourceFile.getBaseName()}----`)
    console.log(sourceFile.getFullText())
})