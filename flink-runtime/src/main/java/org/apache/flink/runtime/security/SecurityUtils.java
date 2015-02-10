/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.flink.runtime.security;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.io.DataOutputBuffer;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.security.Credentials;
import org.apache.hadoop.security.UserGroupInformation;
import org.apache.hadoop.security.token.Token;
import org.apache.hadoop.security.token.TokenIdentifier;

import java.io.ByteArrayInputStream;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.security.PrivilegedExceptionAction;
import java.util.Collection;

public class SecurityUtils {
	public static final String SECURITY_TOKEN_FILE_NAME = ".securityTokens";

	// load Hadoop configuration when loading the security utils.
	private static Configuration hdConf = new Configuration();

	public static boolean isSecurityEnabled() {
		UserGroupInformation.setConfiguration(hdConf);
		return UserGroupInformation.isSecurityEnabled();
	}

	/**
	 * Write security tokens for the current user to the given file.
	 * @param file
	 * @throws Exception
	 */
	public static void writeTokensToFile(File file) throws Exception {
		UserGroupInformation.setConfiguration(hdConf);
		Credentials credentials = new Credentials();
		// for user
		UserGroupInformation currUsr = UserGroupInformation.getCurrentUser();

		Collection<Token<? extends TokenIdentifier>> usrTok = currUsr.getTokens();
		for(Token<? extends TokenIdentifier> token : usrTok) {
			final Text id = new Text(token.getIdentifier());
			credentials.addToken(id, token);
		}
		DataOutputBuffer dob = new DataOutputBuffer();
		credentials.writeTokenStorageToStream(dob);
		FileOutputStream fos = new FileOutputStream(file);
		byte[] currUser = currUsr.getShortUserName().getBytes("UTF-8");
		fos.write(currUser.length);
		fos.write(currUser);
		fos.write(dob.getLength());
		fos.write(dob.getData());
		fos.close();
	}

	public static UserGroupInformation createUserFromTokens(File file) throws Exception {
		FileInputStream fis = new FileInputStream(file);
		int size = fis.read();
		byte[] nameBuf = new byte[size];
		fis.read(nameBuf);
		String userName = new String(nameBuf, "UTF-8");
		UserGroupInformation remoteUser = UserGroupInformation.createRemoteUser(userName);
		size = fis.read();
		byte[] tokenBuf = new byte[size];
		fis.read(tokenBuf);
		Credentials creds = new Credentials();
		ByteArrayInputStream bais = new ByteArrayInputStream(tokenBuf);
		DataInputStream din = new DataInputStream(bais);
		creds.readTokenStorageStream(din);
		din.close();
		for(Token<? extends TokenIdentifier> token : creds.getAllTokens()) {
			remoteUser.addToken(token);
		}
		return remoteUser;
	}

	public static <T> T runSecured(final FlinkSecuredRunner<T> runner) throws Exception {
		UserGroupInformation.setConfiguration(hdConf);
		UserGroupInformation ugi = UserGroupInformation.getCurrentUser();
		T ret = ugi.doAs(new PrivilegedExceptionAction<T>() {
			@Override
			public T run() throws Exception {
				return runner.run();
			}
		});
		return ret;
	}
	public static interface FlinkSecuredRunner<T> {
		public T run() throws Exception;
	}

}
