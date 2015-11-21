
# Classes Annotated with `@PublicInterface`

## In `flink-core`


Class: org.apache.flink.types.LongValue
  - copyNormalizedKey()
  - getValue()
  - copyTo()
  - getMaxNormalizedKeyLen()
  - getBinaryLength()
  - equals()
  - write()
  - hashCode()
  - read()
  - compareTo()
  - toString()
  - setValue()
  - copy()

Class: org.apache.flink.types.Record
  - removeField()
  - isNull()
  - concatenate()
  - setNumFields()
  - clear()
  - copyTo()
  - equalsFields()
  - setField()
  - write()
  - copyFrom()
  - read()
  - copy()
  - createCopy()
  - serialize()
  - getBinaryLength()
  - getField()
  - addField()
  - getNumFields()
  - getFieldsIntoCheckingNull()
  - deserialize()
  - makeSpace()
  - setNull()
  - updateBinaryRepresenation()
  - getFieldsInto()
  - unionFields()
  - getFieldInto()

Class: org.apache.flink.types.CopyableValue
  - copyTo()
  - getBinaryLength()
  - copy()

Class: org.apache.flink.types.NormalizableKey
  - copyNormalizedKey()
  - getMaxNormalizedKeyLen()

Class: org.apache.flink.types.BooleanValue
  - getValue()
  - get()
  - equals()
  - getBinaryLength()
  - set()
  - hashCode()
  - compareTo()
  - setValue()
  - copyNormalizedKey()
  - copyTo()
  - getMaxNormalizedKeyLen()
  - write()
  - read()
  - toString()
  - copy()

Class: org.apache.flink.types.ListValue
  - toArray()
  - iterator()
  - addAll()
  - remove()
  - get()
  - equals()
  - set()
  - listIterator()
  - containsAll()
  - hashCode()
  - lastIndexOf()
  - contains()
  - indexOf()
  - add()
  - size()
  - clear()
  - isEmpty()
  - write()
  - retainAll()
  - read()
  - toString()
  - subList()
  - removeAll()

Class: org.apache.flink.types.MapValue
  - put()
  - remove()
  - get()
  - equals()
  - entrySet()
  - hashCode()
  - keySet()
  - size()
  - clear()
  - isEmpty()
  - containsKey()
  - values()
  - write()
  - containsValue()
  - read()
  - toString()
  - putAll()

Class: org.apache.flink.types.IntValue
  - copyNormalizedKey()
  - getValue()
  - copyTo()
  - getMaxNormalizedKeyLen()
  - getBinaryLength()
  - equals()
  - write()
  - hashCode()
  - read()
  - compareTo()
  - toString()
  - setValue()
  - copy()

Class: org.apache.flink.types.Nothing

Class: org.apache.flink.types.ByteValue
  - copyNormalizedKey()
  - getValue()
  - copyTo()
  - getMaxNormalizedKeyLen()
  - getBinaryLength()
  - equals()
  - write()
  - hashCode()
  - read()
  - compareTo()
  - toString()
  - setValue()
  - copy()

Class: org.apache.flink.types.NullFieldException
  - getFieldPos()

Class: org.apache.flink.types.ResettableValue
  - setValue()

Class: org.apache.flink.types.CharValue
  - copyNormalizedKey()
  - getValue()
  - copyTo()
  - getMaxNormalizedKeyLen()
  - getBinaryLength()
  - equals()
  - write()
  - hashCode()
  - read()
  - compareTo()
  - toString()
  - setValue()
  - copy()

Class: org.apache.flink.types.StringValue
  - getValue()
  - hashCode()
  - copyNormalizedKey()
  - copyTo()
  - getMaxNormalizedKeyLen()
  - substring()
  - write()
  - length()
  - read()
  - setLength()
  - charAt()
  - find()
  - copy()
  - subSequence()
  - append()
  - startsWith()
  - equals()
  - getBinaryLength()
  - readString()
  - getCharArray()
  - compareTo()
  - setValue()
  - setValueAscii()
  - copyString()
  - writeString()
  - toString()

Class: org.apache.flink.types.Value

Class: org.apache.flink.types.DoubleValue
  - getValue()
  - copyTo()
  - getBinaryLength()
  - equals()
  - write()
  - hashCode()
  - read()
  - compareTo()
  - toString()
  - setValue()
  - copy()

Class: org.apache.flink.types.NullValue
  - copyNormalizedKey()
  - copyTo()
  - getMaxNormalizedKeyLen()
  - getBinaryLength()
  - equals()
  - write()
  - hashCode()
  - read()
  - compareTo()
  - toString()
  - getInstance()
  - copy()

Class: org.apache.flink.types.FloatValue
  - getValue()
  - copyTo()
  - getBinaryLength()
  - equals()
  - write()
  - hashCode()
  - read()
  - compareTo()
  - toString()
  - setValue()
  - copy()

Class: org.apache.flink.types.Key
  - equals()
  - hashCode()

Class: org.apache.flink.types.DeserializationException

Class: org.apache.flink.types.KeyFieldOutOfBoundsException
  - getFieldNumber()

Class: org.apache.flink.types.ShortValue
  - copyNormalizedKey()
  - getValue()
  - copyTo()
  - getMaxNormalizedKeyLen()
  - getBinaryLength()
  - equals()
  - write()
  - hashCode()
  - read()
  - compareTo()
  - toString()
  - setValue()
  - copy()

Class: org.apache.flink.types.Pair
  - setSecond()
  - equals()
  - setFirst()
  - write()
  - hashCode()
  - read()
  - compareTo()
  - toString()
  - getFirst()
  - getSecond()

Class: org.apache.flink.configuration.ConfigConstants

Class: org.apache.flink.configuration.Configuration
  - setFloat()
  - getDouble()
  - setBytes()
  - getBoolean()
  - setString()
  - hashCode()
  - getLong()
  - setBoolean()
  - setDouble()
  - getInteger()
  - write()
  - read()
  - setLong()
  - getClass()
  - getBytes()
  - clone()
  - addAll()
  - equals()
  - setClass()
  - keySet()
  - toMap()
  - containsKey()
  - toString()
  - setInteger()
  - getString()
  - getFloat()

Class: org.apache.flink.configuration.UnmodifiableConfiguration
  - addAll()

Class: org.apache.flink.core.io.InputSplitSource
  - createInputSplits()
  - getInputSplitAssigner()

Class: org.apache.flink.core.io.LocatableInputSplit
  - equals()
  - hashCode()
  - toString()
  - getHostnames()
  - getSplitNumber()

Class: org.apache.flink.core.io.InputSplit
  - getSplitNumber()

Class: org.apache.flink.core.io.IOReadableWritable
  - write()
  - read()

Class: org.apache.flink.core.io.InputSplitAssigner
  - getNextInputSplit()

Class: org.apache.flink.core.fs.FileSystem
  - getLocalFileSystem()
  - get()
  - getWorkingDirectory()
  - rename()
  - mkdirs()
  - getNumberOfBlocks()
  - create()
  - isDistributedFS()
  - open()
  - listStatus()
  - getFileStatus()
  - getFileBlockLocations()
  - delete()
  - exists()
  - initOutPathDistFS()
  - initOutPathLocalFS()
  - getDefaultBlockSize()
  - getUri()
  - getHomeDirectory()
  - initialize()

Class: org.apache.flink.core.fs.FileSystem$WriteMode
  - values()
  - valueOf()

Class: org.apache.flink.core.fs.FSDataOutputStream
  - flush()
  - sync()

Class: org.apache.flink.core.fs.BlockLocation
  - getHosts()
  - getOffset()
  - getLength()

Class: org.apache.flink.core.fs.FSDataInputStream
  - getPos()
  - seek()

Class: org.apache.flink.core.fs.FileInputSplit
  - getStart()
  - equals()
  - getPath()
  - hashCode()
  - toString()
  - getLength()

Class: org.apache.flink.core.fs.FileSystem$FSKey
  - equals()
  - hashCode()

Class: org.apache.flink.core.fs.FileStatus
  - getLen()
  - getReplication()
  - getPath()
  - getModificationTime()
  - isDir()
  - getBlockSize()
  - getAccessTime()

Class: org.apache.flink.core.fs.Path
  - toUri()
  - getFileSystem()
  - getParent()
  - equals()
  - makeQualified()
  - hashCode()
  - isAbsolute()
  - compareTo()
  - suffix()
  - depth()
  - getName()
  - write()
  - read()
  - toString()

Class: org.apache.flink.core.memory.DataInputView
  - skipBytesToRead()
  - read()

Class: org.apache.flink.core.memory.DataOutputView
  - write()
  - skipBytesToWrite()

Class: org.apache.flink.api.common.JobID
  - fromByteBuffer()
  - generate()
  - fromByteArray()
  - fromHexString()

Class: org.apache.flink.api.common.ExecutionMode
  - values()
  - valueOf()

Class: org.apache.flink.api.common.functions.RichJoinFunction
  - join()

Class: org.apache.flink.api.common.functions.JoinFunction
  - join()

Class: org.apache.flink.api.common.functions.FoldFunction
  - fold()

Class: org.apache.flink.api.common.functions.FilterFunction
  - filter()

Class: org.apache.flink.api.common.functions.BroadcastVariableInitializer
  - initializeBroadcastVariable()

Class: org.apache.flink.api.common.functions.RichFilterFunction
  - filter()

Class: org.apache.flink.api.common.functions.AbstractRichFunction
  - open()
  - setRuntimeContext()
  - getRuntimeContext()
  - getIterationRuntimeContext()
  - close()

Class: org.apache.flink.api.common.functions.FlatMapFunction
  - flatMap()

Class: org.apache.flink.api.common.functions.Function

Class: org.apache.flink.api.common.functions.ReduceFunction
  - reduce()

Class: org.apache.flink.api.common.functions.GroupReduceFunction
  - reduce()

Class: org.apache.flink.api.common.functions.IterationRuntimeContext
  - getIterationAggregator()
  - getSuperstepNumber()
  - getPreviousIterationAggregate()

Class: org.apache.flink.api.common.functions.RichFlatMapFunction
  - flatMap()

Class: org.apache.flink.api.common.functions.RichFlatJoinFunction
  - join()

Class: org.apache.flink.api.common.functions.RichGroupReduceFunction$Combinable

Class: org.apache.flink.api.common.functions.RichFunction
  - open()
  - setRuntimeContext()
  - getRuntimeContext()
  - getIterationRuntimeContext()
  - close()

Class: org.apache.flink.api.common.functions.RichMapPartitionFunction
  - mapPartition()

Class: org.apache.flink.api.common.functions.CombineFunction
  - combine()

Class: org.apache.flink.api.common.functions.RichGroupCombineFunction
  - combine()

Class: org.apache.flink.api.common.functions.GroupCombineFunction
  - combine()

Class: org.apache.flink.api.common.functions.RichCrossFunction
  - cross()

Class: org.apache.flink.api.common.functions.MapPartitionFunction
  - mapPartition()

Class: org.apache.flink.api.common.functions.MapFunction
  - map()

Class: org.apache.flink.api.common.functions.RichCoGroupFunction
  - coGroup()

Class: org.apache.flink.api.common.functions.RichMapFunction
  - map()

Class: org.apache.flink.api.common.functions.RichReduceFunction
  - reduce()

Class: org.apache.flink.api.common.functions.RuntimeContext
  - getDoubleCounter()
  - getDistributedCache()
  - getBroadcastVariableWithInitializer()
  - getUserCodeClassLoader()
  - getIntCounter()
  - getBroadcastVariable()
  - getAllAccumulators()
  - getHistogram()
  - getExecutionConfig()
  - addAccumulator()
  - getAccumulator()
  - getLongCounter()
  - getKeyValueState()
  - getIndexOfThisSubtask()
  - getTaskName()
  - getNumberOfParallelSubtasks()

Class: org.apache.flink.api.common.functions.CoGroupFunction
  - coGroup()

Class: org.apache.flink.api.common.functions.Partitioner
  - partition()

Class: org.apache.flink.api.common.functions.RichGroupReduceFunction
  - combine()
  - reduce()

Class: org.apache.flink.api.common.functions.RichFoldFunction
  - fold()

Class: org.apache.flink.api.common.functions.CrossFunction
  - cross()

Class: org.apache.flink.api.common.functions.FlatJoinFunction
  - join()

Class: org.apache.flink.api.common.functions.InvalidTypesException

Class: org.apache.flink.api.common.io.LocatableInputSplitAssigner
  - getNextInputSplit()
  - getNumberOfLocalAssignments()
  - getNumberOfRemoteAssignments()

Class: org.apache.flink.api.common.io.SerializedOutputFormat

Class: org.apache.flink.api.common.io.DefaultInputSplitAssigner
  - getNextInputSplit()

Class: org.apache.flink.api.common.io.CleanupWhenUnsuccessful
  - tryCleanupOnError()

Class: org.apache.flink.api.common.io.FileInputFormat
  - getMinSplitSize()
  - getInputSplitAssigner()
  - getSplitStart()
  - getSplitLength()
  - registerInflaterInputStreamFactory()
  - getOpenTimeout()
  - configureFileFormat()
  - setFilePath()
  - getFilePath()
  - setOpenTimeout()
  - close()
  - open()
  - createInputSplits()
  - getNumSplits()
  - setNumSplits()
  - setMinSplitSize()
  - toString()
  - configure()
  - getStatistics()

Class: org.apache.flink.api.common.io.SerializedInputFormat

Class: org.apache.flink.api.common.io.OutputFormat
  - open()
  - writeRecord()
  - configure()
  - close()

Class: org.apache.flink.api.common.io.RichOutputFormat
  - setRuntimeContext()
  - getRuntimeContext()

Class: org.apache.flink.api.common.io.BinaryInputFormat
  - nextRecord()
  - open()
  - createInputSplits()
  - reachedEnd()
  - createBlockInfo()
  - configure()
  - getStatistics()

Class: org.apache.flink.api.common.io.BlockInfo
  - getFirstRecordStart()
  - getRecordCount()
  - getAccumulatedRecordCount()
  - setRecordCount()
  - write()
  - read()
  - getInfoSize()
  - setFirstRecordStart()
  - setAccumulatedRecordCount()

Class: org.apache.flink.api.common.io.InputFormat
  - nextRecord()
  - open()
  - createInputSplits()
  - reachedEnd()
  - getInputSplitAssigner()
  - configure()
  - getStatistics()
  - close()

Class: org.apache.flink.api.common.io.FileOutputFormat
  - getWriteMode()
  - open()
  - tryCleanupOnError()
  - getOutputDirectoryMode()
  - initializeGlobal()
  - configureFileFormat()
  - getOutputFilePath()
  - setOutputFilePath()
  - setWriteMode()
  - configure()
  - setOutputDirectoryMode()
  - close()

Class: org.apache.flink.api.common.io.GenericInputFormat
  - open()
  - createInputSplits()
  - getInputSplitAssigner()
  - configure()
  - getStatistics()
  - close()

Class: org.apache.flink.api.common.io.InputStreamFSInputWrapper
  - read()
  - getPos()
  - seek()

Class: org.apache.flink.api.common.io.RichInputFormat
  - setRuntimeContext()
  - getRuntimeContext()

Class: org.apache.flink.api.common.io.NonParallelInput

Class: org.apache.flink.api.common.io.GenericCsvInputFormat
  - isLenient()
  - setCommentPrefix()
  - setFieldDelimiter()
  - setLenient()
  - isSkippingFirstLineAsHeader()
  - close()
  - enableQuotedStringParsing()
  - open()
  - getFieldDelimiter()
  - setSkipFirstLineAsHeader()
  - getCommentPrefix()
  - getNumberOfFieldsTotal()
  - getNumberOfNonNullFields()

Class: org.apache.flink.api.common.io.FinalizeOnMaster
  - finalizeGlobal()

Class: org.apache.flink.api.common.io.InitializeOnMaster
  - initializeGlobal()

Class: org.apache.flink.api.common.io.BinaryOutputFormat
  - open()
  - writeRecord()
  - configure()
  - close()

Class: org.apache.flink.api.common.io.StrictlyLocalAssignment

Class: org.apache.flink.api.common.io.statistics.BaseStatistics
  - getTotalInputSize()
  - getNumberOfRecords()
  - getAverageRecordWidth()

Class: org.apache.flink.api.common.io.DelimitedInputFormat
  - reachedEnd()
  - configureDelimitedFormat()
  - getBufferSize()
  - readRecord()
  - close()
  - nextRecord()
  - open()
  - setLineLengthLimit()
  - getNumLineSamples()
  - getLineLengthLimit()
  - setBufferSize()
  - setNumLineSamples()
  - configure()
  - getStatistics()
  - getDelimiter()
  - setDelimiter()

Class: org.apache.flink.api.common.JobExecutionResult
  - fromJobSubmissionResult()
  - getNetRuntime()
  - getAccumulatorResult()
  - getAllAccumulatorResults()
  - getIntCounterResult()

Class: org.apache.flink.api.common.typeinfo.TypeInformation
  - isBasicType()
  - isKeyType()
  - isSortKeyType()
  - equals()
  - getTotalFields()
  - createSerializer()
  - canEqual()
  - hashCode()
  - getArity()
  - isTupleType()
  - getGenericParameters()
  - getTypeClass()
  - toString()

Class: org.apache.flink.api.common.ExecutionConfig$GlobalJobParameters
  - toMap()

Class: org.apache.flink.api.common.operators.SemanticProperties
  - getForwardingTargetFields()
  - getReadFields()
  - getForwardingSourceField()

Class: org.apache.flink.api.common.operators.Order
  - isOrdered()
  - values()
  - getShortName()
  - valueOf()

Class: org.apache.flink.api.common.operators.SingleInputSemanticProperties
  - addForwardedField()
  - getForwardingTargetFields()
  - addReadFields()
  - toString()
  - getReadFields()
  - getForwardingSourceField()

Class: org.apache.flink.api.common.CodeAnalysisMode
  - values()
  - valueOf()

Class: org.apache.flink.api.common.accumulators.AccumulatorHelper
  - toResultMap()
  - deserializeAccumulators()
  - getResultsFormated()
  - compareAccumulatorTypes()
  - mergeInto()
  - copy()
  - resetAndClearAccumulators()

Class: org.apache.flink.api.common.accumulators.LongCounter
  - clone()
  - getLocalValue()
  - getLocalValuePrimitive()
  - merge()
  - toString()
  - add()
  - resetLocal()

Class: org.apache.flink.api.common.accumulators.DoubleCounter
  - clone()
  - getLocalValue()
  - merge()
  - toString()
  - add()
  - resetLocal()

Class: org.apache.flink.api.common.accumulators.AverageAccumulator
  - clone()
  - getLocalValue()
  - merge()
  - toString()
  - add()
  - resetLocal()

Class: org.apache.flink.api.common.accumulators.SimpleAccumulator

Class: org.apache.flink.api.common.accumulators.IntCounter
  - clone()
  - getLocalValue()
  - merge()
  - toString()
  - add()
  - resetLocal()

Class: org.apache.flink.api.common.accumulators.Histogram
  - clone()
  - getLocalValue()
  - merge()
  - toString()
  - add()
  - resetLocal()

Class: org.apache.flink.api.common.accumulators.ListAccumulator
  - clone()
  - getLocalValue()
  - merge()
  - toString()
  - add()
  - resetLocal()

Class: org.apache.flink.api.common.accumulators.Accumulator
  - clone()
  - getLocalValue()
  - merge()
  - add()
  - resetLocal()

Class: org.apache.flink.api.common.typeutils.TypeSerializer
  - deserialize()
  - duplicate()
  - equals()
  - serialize()
  - hashCode()
  - canEqual()
  - isImmutableType()
  - getLength()
  - copy()
  - createInstance()

Class: org.apache.flink.api.common.typeutils.TypeComparator
  - extractKeys()
  - supportsSerializationWithKeyNormalization()
  - putNormalizedKey()
  - duplicate()
  - hash()
  - compare()
  - writeWithKeyNormalization()
  - supportsNormalizedKey()
  - getNormalizeKeyLen()
  - compareAgainstReference()
  - equalToReference()
  - getFlatComparators()
  - supportsCompareAgainstReference()
  - compareToReference()
  - compareSerialized()
  - isNormalizedKeyPrefixOnly()
  - setReference()
  - invertNormalizedKey()
  - readWithKeyDenormalization()

Class: org.apache.flink.api.common.aggregators.LongZeroConvergence
  - isConverged()

Class: org.apache.flink.api.common.aggregators.LongSumAggregator
  - getAggregate()
  - aggregate()
  - reset()

Class: org.apache.flink.api.common.aggregators.Aggregator
  - getAggregate()
  - aggregate()
  - reset()

Class: org.apache.flink.api.common.aggregators.ConvergenceCriterion
  - isConverged()

Class: org.apache.flink.api.common.aggregators.AggregatorWithName
  - getName()
  - getAggregator()

Class: org.apache.flink.api.common.aggregators.AggregatorRegistry
  - getConvergenceCriterionAggregatorName()
  - getConvergenceCriterion()
  - registerAggregator()
  - addAll()
  - unregisterAggregator()
  - getAllRegisteredAggregators()
  - registerAggregationConvergenceCriterion()

Class: org.apache.flink.api.common.aggregators.DoubleZeroConvergence
  - isConverged()

Class: org.apache.flink.api.common.aggregators.DoubleSumAggregator
  - getAggregate()
  - aggregate()
  - reset()

Class: org.apache.flink.api.common.cache.DistributedCache
  - getFile()
  - writeFileInfoToConfig()
  - readFileInfoFromConfig()

Class: org.apache.flink.api.common.ExecutionConfig
  - registerTypeWithKryoSerializer()
  - setGlobalJobParameters()
  - setParallelism()
  - getDefaultKryoSerializerClasses()
  - isSysoutLoggingEnabled()
  - disableTimestamps()
  - hashCode()
  - getRegisteredPojoTypes()
  - enableForceKryo()
  - isObjectReuseEnabled()
  - enableTimestamps()
  - isForceAvroEnabled()
  - getGlobalJobParameters()
  - enableClosureCleaner()
  - registerKryoType()
  - getParallelism()
  - getRegisteredTypesWithKryoSerializerClasses()
  - setNumberOfExecutionRetries()
  - getExecutionRetryDelay()
  - setExecutionMode()
  - isAutoTypeRegistrationDisabled()
  - enableForceAvro()
  - equals()
  - disableAutoTypeRegistration()
  - setAutoWatermarkInterval()
  - setExecutionRetryDelay()
  - registerPojoType()
  - isClosureCleanerEnabled()
  - canEqual()
  - areTimestampsEnabled()
  - disableForceKryo()
  - addDefaultKryoSerializer()
  - getDefaultKryoSerializers()
  - getRegisteredTypesWithKryoSerializers()
  - enableSysoutLogging()
  - getCodeAnalysisMode()
  - getExecutionMode()
  - getNumberOfExecutionRetries()
  - enableObjectReuse()
  - disableObjectReuse()
  - isForceKryoEnabled()
  - disableClosureCleaner()
  - getRegisteredKryoTypes()
  - disableSysoutLogging()
  - disableForceAvro()
  - getAutoWatermarkInterval()
  - setCodeAnalysisMode()

Class: org.apache.flink.api.common.state.OperatorState
  - update()
  - value()

Class: org.apache.flink.api.common.JobSubmissionResult
  - getJobID()

Class: org.apache.flink.util.Collector
  - close()
  - collect()

## In `flink-runtime`


Class: org.apache.flink.runtime.state.StateHandle
  - discardState()
  - getState()

Class: org.apache.flink.runtime.state.StateBackend
  - initializeForJob()
  - disposeAllStateForCurrentJob()
  - createKvState()
  - checkpointStateSerializable()
  - createCheckpointStateOutputView()
  - createCheckpointStateOutputStream()
  - close()

Class: org.apache.flink.runtime.jobgraph.tasks.InputSplitProvider
  - getNextInputSplit()



## In `flink-scala`


Class: org.apache.flink.api.scala.ExecutionEnvironment
  - registerTypeWithKryoSerializer()
  - setParallelism()
  - readFileOfPrimitives$default$2()
  - startNewSession()
  - readTextFileWithValue()
  - readCsvFile$default$5()
  - readCsvFile$default$6()
  - registerType()
  - readCsvFile$default$3()
  - readCsvFile$default$4()
  - readCsvFile$default$9()
  - readCsvFile$default$7()
  - readCsvFile$default$8()
  - fromCollection()
  - readTextFileWithValue$default$2()
  - fromParallelCollection()
  - readCsvFile$default$2()
  - getId()
  - generateSequence()
  - execute()
  - createLocalEnvironment()
  - readFileOfPrimitives()
  - createRemoteEnvironment()
  - getExecutionPlan()
  - getLastJobExecutionResult()
  - getExecutionEnvironment()
  - readTextFile()
  - createInput()
  - readFile()
  - getIdString()
  - setSessionTimeout()
  - registerCachedFile$default$3()
  - readSequenceFile()
  - union()
  - getParallelism()
  - readHadoopFile()
  - readTextFile$default$2()
  - setNumberOfExecutionRetries()
  - registerCachedFile()
  - createLocalEnvironment$default$1()
  - createProgramPlan()
  - getSessionTimeout()
  - addDefaultKryoSerializer()
  - createCollectionsEnvironment()
  - fromElements()
  - getNumberOfExecutionRetries()
  - readCsvFile()
  - getJavaEnv()
  - getConfig()
  - createProgramPlan$default$1()
  - createHadoopInput()

Class: org.apache.flink.api.scala.PartitionSortedDataSet
  - sortPartition()

Class: org.apache.flink.api.scala.AggregateDataSet
  - andMin()
  - andMax()
  - andSum()
  - and()

Class: org.apache.flink.api.scala.DataSet
  - flatMap()
  - setParallelism()
  - aggregate()
  - reduceGroup()
  - count()
  - mapPartition()
  - combineGroup()
  - withParameters()
  - coGroup()
  - sortPartition()
  - iterateDelta()
  - distinct()
  - writeAsText()
  - joinWithTiny()
  - writeAsCsv$default$3()
  - writeAsCsv$default$2()
  - fullOuterJoin()
  - writeAsCsv$default$4()
  - writeAsCsv()
  - reduce()
  - javaSet()
  - groupBy()
  - printOnTaskManager()
  - printToErr()
  - withForwardedFields()
  - getExecutionEnvironment()
  - withForwardedFieldsSecond()
  - output()
  - crossWithTiny()
  - filter()
  - collect()
  - cross()
  - rebalance()
  - registerAggregator()
  - joinWithHuge()
  - withForwardedFieldsFirst()
  - iterateWithTermination()
  - sum()
  - crossWithHuge()
  - iterate()
  - getType()
  - clean()
  - writeAsText$default$2()
  - name()
  - union()
  - write()
  - map()
  - getParallelism()
  - write$default$3()
  - clean$default$2()
  - rightOuterJoin()
  - min()
  - leftOuterJoin()
  - max()
  - join()
  - print()
  - withBroadcastSet()
  - partitionByHash()
  - partitionCustom()
  - first()

Class: org.apache.flink.api.scala.JoinDataSet
  - getPartitioner()
  - apply()
  - withPartitioner()

Class: org.apache.flink.api.scala.hadoop.mapreduce.HadoopOutputFormat
  - writeRecord()

Class: org.apache.flink.api.scala.hadoop.mapreduce.HadoopInputFormat
  - nextRecord()

Class: org.apache.flink.api.scala.hadoop.mapred.HadoopOutputFormat
  - writeRecord()

Class: org.apache.flink.api.scala.hadoop.mapred.HadoopInputFormat
  - nextRecord()

Class: org.apache.flink.api.scala.CrossDataSet
  - apply()
  - createCrossOperator()

Class: org.apache.flink.api.scala.CoGroupDataSet
  - getPartitioner()
  - apply()
  - sortSecondGroup()
  - withPartitioner()
  - sortFirstGroup()

Class: org.apache.flink.api.scala.GroupedDataSet
  - min()
  - org$apache$flink$api$scala$GroupedDataSet$$groupSortKeyPositions()
  - aggregate()
  - getCustomPartitioner()
  - org$apache$flink$api$scala$GroupedDataSet$$set()
  - reduceGroup()
  - max()
  - withPartitioner()
  - sortGroup()
  - combineGroup()
  - org$apache$flink$api$scala$GroupedDataSet$$groupSortOrders()
  - sum()
  - first()
  - reduce()

Class: org.apache.flink.api.scala.ExecutionEnvironment$
  - createLocalEnvironment()
  - createLocalEnvironment$default$1()
  - getExecutionEnvironment()
  - createRemoteEnvironment()
  - createCollectionsEnvironment()

Class: org.apache.flink.api.scala.utils.package$DataSetUtils
  - sample$default$3()
  - self()
  - sampleWithSize()
  - zipWithUniqueId()
  - sampleWithSize$default$3()
  - sample()
  - zipWithIndex()


## In `flink-streaming-java`


Class: org.apache.flink.streaming.runtime.streamrecord.StreamRecord
  - replace()
  - getValue()
  - getTimestamp()
  - equals()
  - hashCode()
  - toString()

Class: org.apache.flink.streaming.api.checkpoint.CheckpointNotifier
  - notifyCheckpointComplete()

Class: org.apache.flink.streaming.api.checkpoint.Checkpointed
  - restoreState()
  - snapshotState()

Class: org.apache.flink.streaming.api.checkpoint.CheckpointedAsynchronously

Class: org.apache.flink.streaming.api.functions.TimestampExtractor
  - getCurrentWatermark()
  - extractTimestamp()
  - extractWatermark()

Class: org.apache.flink.streaming.api.functions.windowing.RichWindowFunction

Class: org.apache.flink.streaming.api.functions.windowing.AllWindowFunction
  - apply()

Class: org.apache.flink.streaming.api.functions.windowing.WindowFunction
  - apply()

Class: org.apache.flink.streaming.api.functions.windowing.RichAllWindowFunction

Class: org.apache.flink.streaming.api.functions.AscendingTimestampExtractor
  - getCurrentWatermark()
  - extractTimestamp()
  - extractWatermark()
  - extractAscendingTimestamp()

Class: org.apache.flink.streaming.api.functions.sink.SinkFunction
  - invoke()

Class: org.apache.flink.streaming.api.functions.sink.RichSinkFunction
  - invoke()

Class: org.apache.flink.streaming.api.TimeCharacteristic
  - values()
  - valueOf()

Class: org.apache.flink.streaming.api.environment.LocalStreamEnvironment
  - execute()

Class: org.apache.flink.streaming.api.environment.RemoteStreamEnvironment
  - getPort()
  - execute()
  - getHost()
  - toString()

Class: org.apache.flink.streaming.api.environment.StreamExecutionEnvironment
  - setParallelism()
  - registerTypeWithKryoSerializer()
  - setStateBackend()
  - readTextFileWithValue()
  - addSource()
  - getStateBackend()
  - registerType()
  - clean()
  - readFileStream()
  - enableCheckpointing()
  - fromCollection()
  - disableOperatorChaining()
  - getStreamTimeCharacteristic()
  - getParallelism()
  - getStreamGraph()
  - fromParallelCollection()
  - setNumberOfExecutionRetries()
  - addOperator()
  - generateSequence()
  - execute()
  - createLocalEnvironment()
  - readFileOfPrimitives()
  - createRemoteEnvironment()
  - setStreamTimeCharacteristic()
  - addDefaultKryoSerializer()
  - isForceCheckpointing()
  - isChainingEnabled()
  - fromElements()
  - getNumberOfExecutionRetries()
  - getConfig()
  - socketTextStream()
  - getBufferTimeout()
  - getExecutionPlan()
  - getCheckpointInterval()
  - setDefaultLocalParallelism()
  - getExecutionEnvironment()
  - setBufferTimeout()
  - createInput()
  - readTextFile()
  - readFile()
  - getCheckpointingMode()

Class: org.apache.flink.streaming.api.windowing.assigners.WindowAssigner
  - getWindowSerializer()
  - getDefaultTrigger()
  - assignWindows()

Class: org.apache.flink.streaming.api.windowing.evictors.Evictor
  - evict()

Class: org.apache.flink.streaming.api.windowing.evictors.CountEvictor
  - of()
  - evict()

Class: org.apache.flink.streaming.api.windowing.windows.Window
  - maxTimestamp()

Class: org.apache.flink.streaming.api.windowing.windows.GlobalWindow
  - get()
  - equals()
  - hashCode()
  - toString()
  - maxTimestamp()

Class: org.apache.flink.streaming.api.windowing.windows.TimeWindow
  - getStart()
  - equals()
  - hashCode()
  - toString()
  - maxTimestamp()
  - getEnd()

Class: org.apache.flink.streaming.api.windowing.triggers.CountTrigger
  - of()
  - onProcessingTime()
  - toString()
  - onEventTime()
  - onElement()

Class: org.apache.flink.streaming.api.windowing.triggers.Trigger$TriggerContext
  - registerEventTimeTimer()
  - getKeyValueState()
  - registerProcessingTimeTimer()

Class: org.apache.flink.streaming.api.windowing.triggers.Trigger
  - onProcessingTime()
  - onEventTime()
  - onElement()

Class: org.apache.flink.streaming.api.windowing.triggers.Trigger$TriggerResult
  - isFire()
  - values()
  - merge()
  - valueOf()
  - isPurge()

Class: org.apache.flink.streaming.api.windowing.time.AbstractTime
  - toMilliseconds()
  - equals()
  - getUnit()
  - hashCode()
  - toString()
  - getSize()
  - makeSpecificBasedOnTimeCharacteristic()

Class: org.apache.flink.streaming.api.operators.StreamingRuntimeContext
  - getBroadcastVariable()
  - getBroadcastVariableWithInitializer()
  - getBufferTimeout()
  - getCheckpointMode()
  - getKeyValueState()
  - getInputSplitProvider()
  - registerTimer()
  - isCheckpointingEnabled()

Class: org.apache.flink.streaming.api.CheckpointingMode
  - values()
  - valueOf()

Class: org.apache.flink.streaming.api.datastream.WindowedStream
  - min()
  - apply()
  - trigger()
  - max()
  - getExecutionEnvironment()
  - sum()
  - fold()
  - maxBy()
  - minBy()
  - getInputType()
  - reduce()
  - evictor()

Class: org.apache.flink.streaming.api.datastream.ConnectedStreams
  - flatMap()
  - getSecondInput()
  - transform()
  - partitionByHash()
  - map()
  - getExecutionEnvironment()
  - getFirstInput()
  - getType1()
  - keyBy()
  - getType2()

Class: org.apache.flink.streaming.api.datastream.DataStream
  - flatMap()
  - connect()
  - broadcast()
  - coGroup()
  - timeWindowAll()
  - iterate()
  - transform()
  - getType()
  - forward()
  - union()
  - write()
  - map()
  - getParallelism()
  - writeAsText()
  - getId()
  - getTransformation()
  - global()
  - assignTimestamps()
  - addSink()
  - writeAsCsv()
  - join()
  - print()
  - printToErr()
  - project()
  - getExecutionConfig()
  - countWindowAll()
  - shuffle()
  - partitionByHash()
  - getExecutionEnvironment()
  - split()
  - windowAll()
  - partitionCustom()
  - filter()
  - writeToSocket()
  - keyBy()
  - rebalance()

Class: org.apache.flink.streaming.api.datastream.DataStreamSource
  - setParallelism()

Class: org.apache.flink.streaming.api.datastream.AllWindowedStream
  - min()
  - apply()
  - trigger()
  - max()
  - getExecutionEnvironment()
  - sum()
  - fold()
  - maxBy()
  - minBy()
  - getInputType()
  - reduce()
  - evictor()

Class: org.apache.flink.streaming.api.datastream.KeyedStream
  - min()
  - max()
  - addSink()
  - sum()
  - fold()
  - maxBy()
  - minBy()
  - getKeyType()
  - reduce()
  - transform()
  - timeWindow()
  - window()
  - getKeySelector()
  - countWindow()

Class: org.apache.flink.streaming.api.datastream.IterativeStream
  - withFeedbackType()
  - closeWith()

Class: org.apache.flink.streaming.api.datastream.SplitStream
  - select()

Class: org.apache.flink.streaming.api.datastream.SingleOutputStreamOperator
  - setParallelism()
  - startNewChain()
  - broadcast()
  - global()
  - forward()
  - shuffle()
  - disableChaining()
  - isolateResources()
  - getName()
  - name()
  - setBufferTimeout()
  - startNewResourceGroup()
  - returns()
  - rebalance()

Class: org.apache.flink.streaming.api.datastream.JoinedStreams$Where
  - equalTo()

Class: org.apache.flink.streaming.api.datastream.DataStreamSink
  - setParallelism()
  - getTransformation()
  - disableChaining()
  - name()

Class: org.apache.flink.streaming.api.datastream.CoGroupedStreams
  - where()

Class: org.apache.flink.streaming.api.datastream.IterativeStream$ConnectedIterativeStreams
  - partitionByHash()
  - closeWith()
  - keyBy()

Class: org.apache.flink.streaming.api.datastream.StreamProjection
  - extractFieldTypes()
  - projectTuple10()
  - projectTuple11()
  - projectTuple13()
  - projectTuple12()
  - projectTuple15()
  - projectTuple14()
  - projectTuple17()
  - projectTuple16()
  - projectTuple19()
  - projectTuple18()
  - projectTuple2()
  - projectTuple1()
  - projectTuple6()
  - projectTuple5()
  - projectTuple4()
  - projectTuple3()
  - projectTuple9()
  - projectTuple8()
  - projectTuple7()
  - projectTuple21()
  - projectTuple22()
  - projectTuple20()
  - projectTuple25()
  - projectTuple24()
  - projectTupleX()
  - projectTuple23()

Class: org.apache.flink.streaming.util.serialization.TypeInformationSerializationSchema
  - deserialize()
  - isEndOfStream()
  - serialize()
  - getProducedType()

Class: org.apache.flink.streaming.util.serialization.DeserializationSchema
  - deserialize()
  - isEndOfStream()

Class: org.apache.flink.streaming.util.serialization.SerializationSchema
  - serialize()


## In `flink-streaming-scala`


Class: org.apache.flink.streaming.api.scala.WindowedStream
  - min()
  - apply()
  - trigger()
  - aggregate()
  - max()
  - clean()
  - sum()
  - fold()
  - minBy()
  - maxBy()
  - reduce()
  - evictor()

Class: org.apache.flink.streaming.api.scala.ConnectedStreams
  - flatMap()
  - clean()
  - partitionByHash()
  - map()
  - keyBy()

Class: org.apache.flink.streaming.api.scala.DataStream
  - setParallelism()
  - flatMap()
  - broadcast()
  - coGroup()
  - forward()
  - isolateResources()
  - writeAsText()
  - getId()
  - writeAsCsv$default$3()
  - writeAsCsv$default$2()
  - writeAsCsv$default$5()
  - global()
  - writeAsCsv$default$4()
  - assignTimestamps()
  - addSink()
  - writeAsCsv()
  - printToErr()
  - getExecutionConfig()
  - countWindowAll()
  - setBufferTimeout()
  - split()
  - filter()
  - rebalance()
  - keyBy()
  - startNewChain()
  - connect()
  - assignAscendingTimestamps()
  - getJavaStream()
  - iterate$default$2()
  - timeWindowAll()
  - iterate$default$3()
  - iterate()
  - getType()
  - clean()
  - disableChaining()
  - union()
  - name()
  - writeAsText$default$2()
  - map()
  - write()
  - getParallelism()
  - startNewResourceGroup()
  - join()
  - print()
  - shuffle()
  - partitionByHash()
  - getName()
  - partitionCustom()
  - windowAll()
  - writeToSocket()

Class: org.apache.flink.streaming.api.scala.JoinedStreams$
  - createJoin()

Class: org.apache.flink.streaming.api.scala.AllWindowedStream
  - min()
  - apply()
  - trigger()
  - aggregate()
  - max()
  - clean()
  - sum()
  - fold()
  - minBy()
  - maxBy()
  - reduce()
  - evictor()

Class: org.apache.flink.streaming.api.scala.KeyedStream
  - min()
  - filterWithState()
  - flatMapWithState()
  - mapWithState()
  - max()
  - sum()
  - fold()
  - getKeyType()
  - minBy()
  - maxBy()
  - reduce()
  - timeWindow()
  - window()
  - countWindow()

Class: org.apache.flink.streaming.api.scala.CoGroupedStreams$
  - createCoGroup()

Class: org.apache.flink.streaming.api.scala.function.StatefulFunction
  - state_$eq()
  - open()
  - stateType()
  - applyWithState()
  - state()

Class: org.apache.flink.streaming.api.scala.SplitStream
  - select()

Class: org.apache.flink.streaming.api.scala.StreamExecutionEnvironment
  - setParallelism()
  - registerTypeWithKryoSerializer()
  - readFileStream$default$3()
  - readFileStream$default$2()
  - setStateBackend()
  - readFileOfPrimitives$default$2()
  - scalaClean()
  - readTextFileWithValue()
  - addSource()
  - getStateBackend()
  - registerType()
  - readFileStream()
  - fromCollection()
  - enableCheckpointing()
  - disableOperatorChaining()
  - getStreamTimeCharacteristic()
  - getWrappedStreamExecutionEnvironment()
  - getParallelism()
  - getStreamGraph()
  - fromParallelCollection()
  - setNumberOfExecutionRetries()
  - generateSequence()
  - execute()
  - createLocalEnvironment()
  - createLocalEnvironment$default$1()
  - readFileOfPrimitives()
  - createRemoteEnvironment()
  - setStreamTimeCharacteristic()
  - addDefaultKryoSerializer()
  - fromElements()
  - getNumberOfExecutionRetries()
  - getConfig()
  - socketTextStream()
  - getBufferTimeout()
  - getExecutionPlan()
  - setDefaultLocalParallelism()
  - socketTextStream$default$3()
  - getExecutionEnvironment()
  - socketTextStream$default$4()
  - setBufferTimeout()
  - createInput()
  - readTextFile()
  - readFile()
  - getCheckpointingMode()

Class: org.apache.flink.streaming.api.scala.JoinedStreams
  - createJoin()

Class: org.apache.flink.streaming.api.scala.CoGroupedStreams
  - createCoGroup()



## In `flink-connector-kafka`


Class: org.apache.flink.streaming.connectors.kafka.FlinkKafkaConsumer082

Class: org.apache.flink.streaming.connectors.kafka.partitioner.KafkaPartitioner
  - open()

Class: org.apache.flink.streaming.connectors.kafka.FlinkKafkaConsumer081

Class: org.apache.flink.streaming.connectors.kafka.FlinkKafkaProducer
  - open()
  - setLogFailuresOnly()
  - invoke()
  - getPropertiesFromBrokerList()
  - close()


## In `flink-connector-filesystem`


Class: org.apache.flink.streaming.connectors.fs.StringWriter
  - open()
  - flush()
  - duplicate()
  - write()
  - close()

Class: org.apache.flink.streaming.connectors.fs.Clock
  - currentTimeMillis()

Class: org.apache.flink.streaming.connectors.fs.Bucketer
  - shouldStartNewBucket()
  - getNextBucketPath()

Class: org.apache.flink.streaming.connectors.fs.RollingSink
  - setWriter()
  - setPendingSuffix()
  - setInProgressPrefix()
  - setPendingPrefix()
  - setValidLengthSuffix()
  - close()
  - setPartPrefix()
  - setBucketer()
  - open()
  - setInputType()
  - notifyCheckpointComplete()
  - invoke()
  - setValidLengthPrefix()
  - disableCleanupOnOpen()
  - restoreState()
  - setInProgressSuffix()
  - setAsyncTimeout()
  - setBatchSize()
  - snapshotState()

Class: org.apache.flink.streaming.connectors.fs.DateTimeBucketer
  - shouldStartNewBucket()
  - toString()
  - setClock()
  - getNextBucketPath()

Class: org.apache.flink.streaming.connectors.fs.Writer
  - open()
  - flush()
  - duplicate()
  - write()
  - close()

Class: org.apache.flink.streaming.connectors.fs.SystemClock
  - currentTimeMillis()

Class: org.apache.flink.streaming.connectors.fs.NonRollingBucketer
  - shouldStartNewBucket()
  - toString()
  - getNextBucketPath()

Class: org.apache.flink.streaming.connectors.fs.SequenceFileWriter
  - open()
  - flush()
  - duplicate()
  - setInputType()
  - write()
  - close()

## In `flink-avro`


Class: org.apache.flink.api.java.io.AvroInputFormat
  - nextRecord()
  - open()
  - reachedEnd()
  - getProducedType()
  - setUnsplittable()
  - setReuseAvroValue()

Class: org.apache.flink.api.java.io.AvroOutputFormat
  - open()
  - writeRecord()
  - setSchema()
  - close()

## In `flink-hadoop-compatibility`

  - flatMap()
  - open()
  - getProducedType()

Class: org.apache.flink.hadoopcompatibility.mapred.HadoopReduceFunction
  - open()
  - getProducedType()
  - reduce()

Class: org.apache.flink.hadoopcompatibility.mapred.HadoopReduceCombineFunction
  - open()
  - combine()
  - getProducedType()
  - reduce()

Class: org.apache.flink.hadoopcompatibility.mapred.wrapper.HadoopOutputCollector
  - setFlinkCollector()
  - collect()



