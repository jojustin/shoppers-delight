# Nodejs Sample Application for IBM Cloud App Configuration service
> **DISCLAIMER**: This is a guideline sample application and is used for demonstrative and illustrative purposes only. This is not a production ready code.

This sample contains an NodeJS project that you can use to learn more about the IBM Cloud App Configuration service.

## Contents
  - [Prerequisite](#prerequisite)
  - [Create an instance of App Configuration service](#create-an-instance-of-app-configuration-service)
  - [Setup the app](#setup-the-app)
    - [Prerequisites](#prerequisites)
    - [Next steps](#next-steps)
  - [Run the app locally](#run-the-app-locally)
  - [Test the app with feature toggle and segmentation](#test-the-app-with-feature-toggle-and-segmentation)
- [License](#license)

## Prerequisite

- You need an [IBM Cloud](http://cloud.ibm.com/) account. If you don't have an account, create one [here](https://cloud.ibm.com/registration/).

## Create an instance of App Configuration service
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
    git clone https://github.com/saikumar1607/shopping-website.git
    cd shopping-website
    ```
- Setup or configure your app configuration service instance
    - Navigate to dashboard of your app configuration instance.
    - Go to Service credentials section and generate a new set of credentials. Note down the `apikey` and `guid`. These credentials are required in the next steps.
    - From your terminal, inside the source code execute the `demo.sh` script by running below command
        ```bash
        $ ./demo.sh
        ```
    - Provide all the inputs during script execution. A sample example is shown in below figure
      <img src="README_IMG1.png" width=75% height=50%/>
    - Script execution takes time. Script is executed successfully only when you see the log `---Demo script complete---` at the end in your terminal.
    - This script will create the collections, feature flags & segments in the instance which are required for the shopping app.
- Edit the configuration values in file [`server.js`](server.js)
    - Replace `region`, `guid` & `apikey` at [line 21](server.js#L21) with the values you obtained from the Service credentials section of the instance.
- Installing Dependencies
    - Run `npm install` from the root folder to install the app’s dependencies.

## Run the app locally
- Run `npm start` to start the app
- Access the running app in a browser at http://localhost:3000


## Test the app with feature toggle and segmentation
- Keep the app running. From the App Configuration service instance dashboard, navigate to Feature flags section.
- Turn ON the toggle for `Flash sale banner` feature flag. Once turned ON, refresh your app running on localhost:3000. You will observe a banner image added on top of your homepage. And when the toggle is turned OFF, the banner image disappears or is removed from the home page.
- `Flash sale date` feature flag will act in synchronized with `Flash sale banner`. Changing the enabled & disabled value by editing the `Flash sale date` feature flag, the date on banner image is altered.
- Similarly turn ON the toggle for `Bluetooth earphones` feature flag & refresh the running app. Since this feature flag is targeted to segment - `Bluetooth earphones segment`, all the bluetooth earphones items are listed in the homepage only when the app is accessed between 10am to 12pm local time.

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

See [here](https://cloud.ibm.com/docs/app-configuration) for detailed docs on App Configuration service.