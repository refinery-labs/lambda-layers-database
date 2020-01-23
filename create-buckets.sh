#!/usr/bin/env bash

randoms3prefix="layers-$(uuidgen)"
randoms3prefix=$( echo $randoms3prefix | tr '[:upper:]' '[:lower:]' )
echo "Randomly generated S3 bucket prefix is $randoms3prefix!"

# Excluded regions: ap-east-1, ap-northeast-3, me-south-1
regionArray=( us-east-2 us-west-1 us-west-2 ap-south-1 ap-northeast-2 ap-southeast-1 ap-southeast-2 ap-northeast-1 ca-central-1 eu-central-1 eu-west-1 eu-west-2 eu-west-3 eu-north-1 sa-east-1 )

# AWS region us-east-1 is unique in that you can't specify a location constraint for it.
# For all other regions this is required.
aws s3api create-bucket --region "us-east-1" --bucket "$randoms3prefix-us-east-1"

for region in "${regionArray[@]}"
do
   : 
   echo "Creating S3 bucket in region $region..."
   aws s3api create-bucket --region "$region" --bucket "$randoms3prefix-$region" --create-bucket-configuration LocationConstraint="$region"
done

echo "Generating config.env file..."
echo "export LAMBDA_LAYERS_S3_PREFIX=$randoms3prefix" > config.env