/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.apache.flink.fs.tachyon;


import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.net.URI;

import org.apache.flink.api.java.LocalEnvironment;
import org.apache.flink.core.fs.BlockLocation;
import org.apache.flink.core.fs.FSDataInputStream;
import org.apache.flink.core.fs.FSDataOutputStream;
import org.apache.flink.core.fs.FileStatus;
import org.apache.flink.core.fs.FileSystem;
import org.apache.flink.core.fs.Path;
import org.apache.flink.example.java.wordcount.WordCount;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import tachyon.client.TachyonFS;
import tachyon.master.LocalTachyonCluster;

public class TachyonFileSystemTest {
	private LocalTachyonCluster cluster = null;
	private TachyonFS mTfs = null;
	private static final FileSystem fs = new TachyonFileSystem();
	private static String SCHEME_HOST;
	private static Path testDir1;
	private static Path testDir2;
	private static Path testFilePath1;
	private static Path testFilePath2;

	@Before
	public void setUpClass() throws Exception {
		SCHEME_HOST = "tachyon://" + InetAddress.getLocalHost().getCanonicalHostName() + ":18998";
		testDir1 = new Path(SCHEME_HOST + "/test");
		testDir2 = new Path(SCHEME_HOST + "/test/result");
		testFilePath1 = new Path(SCHEME_HOST + "/test/file1");
		testFilePath2 = new Path(SCHEME_HOST + "/test/file2");
		// Start local tachyon
		System.setProperty("tachyon.user.quota.unit.bytes", "1000");
		cluster = new LocalTachyonCluster(256*64*64);
		cluster.start();
		fs.initialize(URI.create(SCHEME_HOST));
	}

	@After
	public void tearDownClass() throws Exception {
		cluster.stop();
	}

	@After
	public void tearDown() throws IOException {
		System.err.println("Starting tear down");
		if (fs.exists(testDir1)) {
			fs.delete(testDir1, true);
		}
	}

	@Test
	public void testWordCount() throws Exception {
		System.err.println("Starting test code");
		fs.mkdirs(testDir1);
		FSDataOutputStream out = fs.create(testFilePath1, true, 0, (short)0, 32);
		for (int x = 0; x < 10; x++) {
			out.write("hello\n".getBytes());
			out.write("world\n".getBytes());
		}
		out.close();
		System.err.println("Trigger");
		new DopOneTestEnvironment(); // load class to trigger static ctor.
		System.err.println("Callin main");
		WordCount.main(new String[]{testFilePath1.toString(), testDir2.toString()});
		FileStatus[] files = fs.listStatus(testDir2);
		assertTrue("The job did not create any files", fs.exists(testDir2));
		FSDataInputStream in = fs.open(files[0].getPath());
		BufferedReader br = new BufferedReader(new InputStreamReader(in));
		String line = br.readLine();
		assertEquals("hello 10", line);
		line = br.readLine();
		assertEquals("world 10", line);
		assertEquals(null, br.readLine());
	}

	private static final class DopOneTestEnvironment extends LocalEnvironment {
		static {
			LocalEnvironment le = new LocalEnvironment();
			le.setDegreeOfParallelism(1);
			initializeContextEnvironment(le);
		}
	}

	@Test
	public void testGetFileStatus() throws Exception {
		fs.mkdirs(testDir1);
		fs.create(testFilePath1, true);
		FileStatus info = fs.getFileStatus(testFilePath1);
		assertEquals(0, info.getLen());
		assertEquals(testFilePath1, info.getPath());
		assertFalse(info.isDir());
	}

	@Test
	public void testGetFileBlockLocations() throws Exception {
		fs.mkdirs(testDir1);
		BlockLocation[] info;
		FSDataOutputStream out;

		out = fs.create(testFilePath1, true, 0, (short) 0, 8);
		out.write("i-fit".getBytes());
		out.close();

		info = fs.getFileBlockLocations(fs.getFileStatus(testFilePath1), 0, 1);
		assertEquals(1, info.length);

		out = fs.create(testFilePath2, true, 0, (short) 0, 8);
		out.write("i-am-too-big-for-one-block".getBytes());
		out.close();

		info = fs.getFileBlockLocations(fs.getFileStatus(testFilePath2), 0, 15);
		assertEquals(2, info.length);
	}

	@Test
	public void testOpenPath1() throws Exception {
		fs.mkdirs(testDir1);

		FSDataOutputStream out = fs.create(testFilePath1, true);
		out.write("teststring".getBytes());
		out.close();

		FSDataInputStream in = fs.open(testFilePath1, 4);
		assertTrue(in.read() == 116);
		in.close();
	}

	@Test
	public void testOpenPath2() throws Exception {
		fs.mkdirs(testDir1);

		FSDataOutputStream out = fs.create(testFilePath1, true);
		out.write("teststring".getBytes());
		out.close();

		FSDataInputStream in = fs.open(testFilePath1);
		assertTrue(in.read() == 116);
		in.close();
	}

	@Test
	public void testListStatus() throws Exception {
		fs.mkdirs(testDir1);
		fs.create(testFilePath1, true);
		fs.create(testFilePath2, true);
		FileStatus[] info = fs.listStatus(testDir1);
		assertEquals(2, info.length);
	}

	@Test
	public void testDelete() throws Exception {
		fs.mkdirs(testDir1);
		fs.create(testFilePath1, true);

		fs.delete(testFilePath1, true);
		assertFalse(fs.exists(testFilePath1));

		fs.delete(testDir1, true);
		assertFalse(fs.exists(testDir1));
	}

	@Test
	public void testMkdirs() throws Exception {
		fs.mkdirs(testDir1);
		assertTrue(fs.exists(testDir1));
	}

	@Test
	public void testCreate5() throws Exception {
		fs.mkdirs(testDir1);
		fs.create(testFilePath1, true, 0, (short) 0, 1048576);

		FileStatus info = fs.getFileStatus(testFilePath1);
		assertTrue(info.getBlockSize() == 1048576);
	}

	@Test
	public void testCreate2() throws Exception {
		fs.create(testDir1, true);

		assertTrue(fs.exists(testDir1));
	}

	@Test
	public void testRename() throws Exception {
		fs.mkdirs(testDir1);
		fs.create(testFilePath1, true);
		fs.rename(testFilePath1, testFilePath2);

		assertFalse(fs.exists(testFilePath1));
		assertTrue(fs.exists(testFilePath2));
	}
}
