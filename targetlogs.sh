# (C) Copyright IBM Corp. 2021.

# Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
# the License. You may obtain a copy of the License at

# http://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
# an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.

# NOTE : This script is just a guidelined usage there may be errors that can happen based on your environment.

#!/bin/bash
set -e


#---------------------------------Setup base url values-------------------------
region[1]="https://us-south.apprapp.cloud.ibm.com/apprapp/feature/v1/instances"
region[2]="https://eu-gb.apprapp.cloud.ibm.com/apprapp/feature/v1/instances"
region[3]="https://au-syd.apprapp.cloud.ibm.com/apprapp/feature/v1/instances"
tokenURL="https://iam.cloud.ibm.com/identity/token"
urlSeparator="/"
environmentName=""
environmentId=""
environments="environments"
collections="collections"
features="features"
segments="segments"

generateEnvId(){
	environmentId="$(tr [A-Z] [a-z] <<< "$1")"
}
#---------------------------------Get inputs for the script to run------------------------
printf "\nEnter the region where your App configuration service is created\n1. us-south (Dallas)\n2. eu-gb (London)\n3. au-syd (Sydney)\n\n"

read -p "Enter region number> "  regionIn
printf "\n"
read -p "Enter Environment Id> "  environment_id
printf "\n"
read -p "Enter apikey: (Obtained from Service credentials tab of your instance): "  apikey
printf "\n"
read -p "Enter guid: (Obtained from Service credentials tab of your instance): "  guid

#---------------------------------Setup input params-------------------------
baseURL=${region[${regionIn}]}
baseURL="$baseURL$urlSeparator$guid"

#---------------------------------Setup input params-------------------------
environmentURL="$baseURL$urlSeparator$environments"
segmentURL="$baseURL$urlSeparator$segments"
# collectionURL="$baseURL$urlSeparator$collections"
featureURL="$baseURL$urlSeparator$environments$urlSeparator$environment_id$urlSeparator$features"
tokenResponse=$(curl -s -X POST $tokenURL -H "Content-Type: application/x-www-form-urlencoded" -d 'grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey='"$apikey"'')
access_token=($((echo $tokenResponse | jq -r '.access_token') | tr -d \'\"))

set -e

updateFeature()
{
	curl -sb -H "Accept: application/json" -H "Authorization: Bearer $access_token" $segmentURL?tags=logs > auto.json
	if [ -s auto.json ] && grep -q "segments" auto.json
	then
		featureId="log-level"
		featureUpdateURL=$featureURL$urlSeparator$featureId
		segmentIds=($((<auto.json jq -r '.segments' | jq . | jq -r '.[].segment_id | @sh') | tr -d \'\"))
		printf "segmentIds is $segmentIds"
		featureStatus=$(curl -s --write-out 'HTTPSTATUS:%{http_code}'  -X PUT $featureUpdateURL -H "Authorization: Bearer $access_token" -H "Content-Type: application/json" --data '{"name": "Log Level","description": "Log level for application.","enabled_value": "info", "disabled_value": "info","tags": "logs", "collections": [{"collection_id": "shoppers-delight"}],"enabled": true, "segment_rules": [{"rules": [{"segments": ["'"${segmentIds}"'"]}],"value": "debug","order": "1"}]}' )
		HTTP_BODY=$(echo $featureStatus | sed -e 's/HTTPSTATUS\:.*//g' | jq .)
		HTTP_STATUS=$(echo $featureStatus | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
		if [ $HTTP_STATUS != 200 ]
		then	
			printf "%b\n \e[31m Failure : Feature update failed with error code $HTTP_STATUS and body $HTTP_BODY \e[39m"
			cleanup
		else 
			featureId=$(echo $HTTP_BODY | jq -rc '.feature_id')
			printf "%bSuccess:  Feature updated with id $featureId\n"
		fi    
	fi

}

#------------------------------------Feature tests---------------------------
printf "%b\n************************** Update features for demo **************************\n"
updateFeature

printf "%b\n \e[32m--------------------------Demo script complete %b--------------------------\n"
