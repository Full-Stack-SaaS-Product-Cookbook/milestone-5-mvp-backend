import { Project, SourceFile } from "ts-morph";
import Constants from "../constants/Constants";
import ApiErrorMessage from "../enum/ApiErrorMessageEnum";
import Primitive from "../enum/Primitive";
import {
  convertPropertyNameToActionConstName,
  convertPropertyNameToActionFunctionName,
  convertPropertyNameToActionInterfaceName,
  isLowerCase,
} from "../helpers/StringConversionHelpers";
import ITypeScriptProperty from "../interfaces/ITypeScriptProperty";

export default class CodeGeneratorService {
  private readonly project: Project;
  private readonly typesFile: SourceFile;
  private readonly reducersFile: SourceFile;
  private readonly actionsFile: SourceFile;
  private readonly stateProperties: Array<ITypeScriptProperty>;
  private readonly statePrefix: string;

  constructor(stateCode: string) {
    this.project = new Project({
      useInMemoryFileSystem: true,
    });

    this.typesFile = this.project.createSourceFile(
      Constants.TYPES_FILE_NAME,
      stateCode
    );

    this.runTypesFileValidations();

    this.reducersFile = this.project.createSourceFile(
      Constants.REDUCERS_FILE_NAME
    );
    this.actionsFile = this.project.createSourceFile(
      Constants.ACTIONS_FILE_NAME
    );

    this.statePrefix = this.typesFile
      .getInterfaces()[0]
      .getName()
      .replace(Constants.STATE_SUFFIX, "");

    this.stateProperties = this.typesFile
      .getInterfaces()[0]
      .getProperties()
      .map((propertySignature) => {
        return {
          name: propertySignature.getName(),
          type: propertySignature.getType().getText() as Primitive,
        };
      });

    this.generateTypesFile();
    this.generateReducersFile();
    this.generateActionsFile();
  }

  public getSourceFiles(): Array<SourceFile> {
    return this.project.getSourceFiles();
  }

  private runTypesFileValidations() {
    if (this.typesFile.getPreEmitDiagnostics().length > 0) {
      throw new Error(ApiErrorMessage.FIX_SYNTAX_ERRORS);
    }

    if (this.typesFile.getInterfaces().length !== 1) {
      throw new Error(ApiErrorMessage.ONE_INTERFACE_LIMIT);
    }

    if (
      !this.typesFile
        .getInterfaces()[0]
        .getName()
        .includes(Constants.STATE_SUFFIX)
    ) {
      throw new Error(ApiErrorMessage.STATE_IDENTIFIER_IN_INTERFACE_REQUIRED);
    }

    if (isLowerCase(this.typesFile.getInterfaces()[0].getName()[0])) {
      throw new Error(ApiErrorMessage.STATE_NAME_MUST_BE_CAPITALIZED);
    }

    if (this.typesFile.getInterfaces()[0].getProperties().length > 5) {
      throw new Error(ApiErrorMessage.MAX_FIVE_PROPERTIES_ALLOWED_IN_STATE);
    }

    if (
      !this.typesFile
        .getInterfaces()[0]
        .getProperties()
        .every((propertySignature) =>
          Object.values(Primitive).includes(
            propertySignature.getType().getText() as Primitive
          )
        )
    ) {
      throw new Error(
        ApiErrorMessage.ONLY_PRIMITIVES_SUPPORTED_AS_STATE_PROPERTY_TYPES
      );
    }
  }

  private generateTypesFile() {
    this.stateProperties.forEach((stateProperty) => {
      this.typesFile.addStatements(
        this.generateActionConstLine(stateProperty.name)
      );
    });

    this.stateProperties.forEach((stateProperty) => {
      this.typesFile.addStatements(this.generateActionInterface(stateProperty));
    });

    this.typesFile.addStatements(this.generateActionTypeUnion());
  }

  private generateReducersFile() {
    this.reducersFile.addStatements(this.generateInitialState());
    this.reducersFile.addStatements(this.generateReducer());
    this.reducersFile.fixMissingImports();
    this.reducersFile.organizeImports();
  }

  private generateActionsFile() {
    this.stateProperties.forEach((stateProperty) => {
      this.actionsFile.addStatements(
        this.generateActionFunction(stateProperty)
      );
    });
    this.actionsFile.fixMissingImports();
    this.actionsFile.organizeImports();
  }

  private generateActionConstLine(propertyName: string): string {
    const actionConstantName =
      convertPropertyNameToActionConstName(propertyName);
    return `export const ${actionConstantName} = "${actionConstantName}"`;
  }

  private generateActionInterface(property: ITypeScriptProperty): string {
    return `export interface ${convertPropertyNameToActionInterfaceName(
      property.name
    )} {
    type: typeof ${convertPropertyNameToActionConstName(property.name)};
    payload: {
        ${property.name}: ${property.type};
    };
}`;
  }

  private generateActionTypeUnion() {
    return `export type ${this.getActionUnionTypeName()} = ${this.typesFile
      .getInterfaces()
      .slice(1)
      .map((interfaceDeclarations) => interfaceDeclarations.getName())
      .join(" | ")}`;
  }

  private getActionUnionTypeName() {
    return `${this.statePrefix}ActionTypes`;
  }

  private getStateName() {
    return `${this.statePrefix}State`;
  }

  private getInitialStateName() {
    return `initial${this.getStateName()}`;
  }

  private getReducerName() {
    return `${this.statePrefix}Reducer`;
  }

  private generateInitialState() {
    return `export const ${this.getInitialStateName()}: ${this.getStateName()} = {
${this.getInitialStateProperties()}
}`;
  }

  private getInitialStateProperties(): string {
    return this.stateProperties
      .map((stateProperty) => {
        return `  ${
          stateProperty.name
        }: ${this.getDefaultInitialStatePropertyValue(stateProperty.type)}`;
      })
      .join(",\n");
  }

  private getDefaultInitialStatePropertyValue(type: Primitive): string {
    switch (type) {
      case "number":
      case "bigint":
        return "0";
      case "boolean":
        return "false";
      case "string":
        return "''";
      case "symbol":
        return "new Symbol('')";
      case "number[]":
      case "boolean[]":
      case "string[]":
      case "symbol[]":
      case "bigint[]":
        return "[]";
      default:
        return "''";
    }
  }

  private generateReducer() {
    return `export function ${this.getReducerName()}(
    state = ${this.getInitialStateName()},
    action: ${this.getActionUnionTypeName()}
): ${this.getStateName()} {
switch (action.type) {
${this.generateReducerCaseStatements()}
    default:
        return state;
    }
}`;
  }

  private generateReducerCaseStatements() {
    return this.stateProperties
      .map((stateProperty) => {
        return `    case ${convertPropertyNameToActionConstName(
          stateProperty.name
        )}:
        return {
            ...state,
            ${stateProperty.name}: action.payload.${stateProperty.name}
        }`;
      })
      .join("\n");
  }

  private generateActionFunction(property: ITypeScriptProperty): string {
    return `export function ${convertPropertyNameToActionFunctionName(
      property.name
    )}(${property.name}: ${property.type}): ${this.getActionUnionTypeName()} {
    return {
        type: ${convertPropertyNameToActionConstName(property.name)},
        payload: {
            ${property.name}
        }
    } as const;
}`;
  }
}
