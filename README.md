# Simple Nodejs e-commerce Application leveraging the IBM App Configuration Service
This sample contains an NodeJS project that you can use to learn more about the IBM Cloud App Configuration Service.

## Contents
- [Prerequisite](#prerequisite)
- [Create an instance of IBM Cloud App Configuration Service](#create-an-instance-of-app-configuration-service)
- [Setup the app](#setup-the-app)
   * [Prerequisites](#prerequisites)
   * [Next steps](#next-steps)
- [Run the app locally](#run-the-app-locally)
- [Test the app with feature toggle and segmentation](#test-the-app-with-feature-toggle-and-segmentation)
- [License](#license)

## Prerequisite

- You need an [IBM Cloud](http://cloud.ibm.com/) account. If you don't have an account, create one [here](https://cloud.ibm.com/registration/).

## Create an instance of App Configuration Service
- Log in to your IBM Cloud account.
- In the [IBM Cloud catalog](https://cloud.ibm.com/catalog#services), search **App Configuration** and select [App Configuration](https://cloud.ibm.com/catalog/services/apprapp). The service configuration screen opens.
- **Select a region** - Currently, Dallas (us-south) and London (eu-gb) region is supported.
- Select a pricing plan, resource group and configure your resource with a service name, or use the preset name.
- Click **Create**. A new service instance is created and the App Configuration console displayed.

## Setup the app
### Prerequisites
- Node.js installed on your machine.
- jq - command-line JSON processor. Install it from [here](https://stedolan.github.io/jq/download/).

### Next steps
- Download the source code
    ```
    git clone https://github.com/examplepath/examplepath
    cd <repoistory name>
    ```
- Setup or configure your app configuration service instance
    - Navigate to dashboard of your app configuration instance.
    - Go to Service credentials section and generate a new set of credentials. Note down the `apikey` and `guid`. These credentials are required in the next steps.
    - From your terminal, inside the source code exceute the `demo.sh` script by running below command
        ```
        ./demo.sh
        ```
    - Provide all the inputs during script excecution. A sample example is shown in below figure
      <img src="README_IMG1.png" width=75% height=50%/>
    - Script execution takes time. Script is executed successfully only when you see the log `---Demo script complete---` at the end in your terminal.
- Edit the configuration values in file [`server.js`](server.js)
    - Replace `region`, `guid` & `apikey` at [line 21](server.js#L21) with the values you obtained from the Service credentials section of the instance.
- Installing Dependencies
    - Run `npm install` from the root folder to install the app’s dependencies.

## Run the app locally
- Run `npm start` to start the app
- Access the running app in a browser at http://localhost:3000


## Test the app with feature toggle and segmentation
- Explain feature toggle use case 1
- Explain feature toggle use case 2
- Explain feature toggle use case 3

# License
Copyright 2020 IBM Corp.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at  [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)
unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

See [here](https://cloud.ibm.com/docs/app-configuration) for detailed docs on App Configuration Service.