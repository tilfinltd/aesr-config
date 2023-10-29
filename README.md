# aesr-config

This is an npm library that facilitates parsing and provides type interfaces for AWS Extend Switch Roles (AESR) configuration text.
It offers both a library and a command-line interface to parse AESR configurations.

## Installation

Install aesr-config by running the following command:

```
$ npm install aesr-config
```

If you wish to use it globally as a command-line tool, install it globally:

```
$ npm install -g aesr-config
```

## Usage

### As a Library

Here’s a more detailed example of how to use aesr-config as a library in your JavaScript code.
This example demonstrates reading a configuration file, parsing it, and logging the output.

```javascript
import { ConfigParser } from 'aesr-config';
import * as fs from 'node:fs';

// Reading configuration text from a file
const configText = fs.readFileSync('config.ini', 'utf8');

// Parsing the configuration text
const profileSet = ConfigParser.parseIni(configText);

// Logging the parsed configuration
console.log(JSON.stringify(profileSet, null, 2));
```

In this example, the configuration text is read from a file named config.ini, and then it is parsed into a JSON object which is then logged to the console.

### Command Line

**aesr-config** is particularly powerful when utilized from the command line, providing a dedicated command **parse-aesr-config** that significantly simplifies the parsing of AESR configurations.
This dedicated command seamlessly integrates into shell scripts and automated workflows.

```
$ parse-aesr-config <<EOF
[profile foo]
aws_account_id = 123456789012
role_name = developer
region = us-east-1
EOF
{"singles":[{"name":"foo","aws_account_id":"123456789012","role_name":"developer","region":"us-east-1"}],"complexes":[]}
```

In this example, the configuration details are passed directly, and the parsed output is displayed in the console as a JSON object.

The `--indent 2` option will format the output JSON with an indentation of 2 spaces, making the JSON output more readable:

```json
{
  "singles": [
    {
      "name": "foo",
      "aws_account_id": "123456789012",
      "role_name": "developer",
      "region": "us-east-1"
    }
  ],
  "complexes": []
}
```

## Additional Information

* Ensure that the configuration file or text is correctly formatted according to the AWS Extend Switch Roles specifications.
* The parsed output will contain two sections: singles and complexes, where singles contains individual profiles and complexes contains both base profiles and target profiles, indicating the roles to switch from and to.
