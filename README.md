# milestone-5-mvp-backend

The backend MVP milestone for the book!

# Installation

You will need to install the NuGet package `Jering.Javascript.NodeJS` (though this should be handled automatically when opening the project in an IDE like Visual Studio). Then, this repository should run fine by starting it in Visual Studio, or with the CLI command:

```bash
dotnet run
```

At this MVP stage, there are only two endpoints exposed: 

- `/` A GET endpoint, returns a version string
- `/CodeGenerator` a POST endpoint, returns generated Redux code based on the desired Redux state alone