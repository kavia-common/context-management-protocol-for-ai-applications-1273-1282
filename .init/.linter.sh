#!/bin/bash
cd /home/kavia/workspace/code-generation/context-management-protocol-for-ai-applications-1273-1282/model_context_protocol_frontend
npx eslint
ESLINT_EXIT_CODE=$?
npm run build
BUILD_EXIT_CODE=$?
if [ $ESLINT_EXIT_CODE -ne 0 ] || [ $BUILD_EXIT_CODE -ne 0 ]; then
   exit 1
fi

