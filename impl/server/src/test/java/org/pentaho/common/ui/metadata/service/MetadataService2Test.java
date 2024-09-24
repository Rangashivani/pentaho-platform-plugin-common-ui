/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

package org.pentaho.common.ui.metadata.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.junit.Before;
import org.junit.Test;
import org.pentaho.commons.connection.IPentahoMetaData;
import org.pentaho.commons.connection.IPentahoResultSet;
import org.pentaho.commons.connection.marshal.MarshallableResultSet;
import org.pentaho.metadata.datatable.DataTable;
import org.pentaho.metadata.model.Domain;
import org.pentaho.metadata.model.LogicalModel;
import org.pentaho.metadata.model.concept.types.LocalizedString;
import org.pentaho.metadata.model.thin.Model;
import org.pentaho.metadata.model.thin.ModelInfo;
import org.pentaho.metadata.model.thin.Query;
import org.pentaho.metadata.query.model.util.QueryXmlHelper;
import org.pentaho.metadata.repository.IMetadataDomainRepository;

public class MetadataService2Test {

  private static final String DEFAULT_LOCALE = "en";
  private static final String[] DEFAULT_LOCALES_CODES = new String[] { DEFAULT_LOCALE };

  private static final String PROVIDER_ID = "provider_id";
  private static final String DOMAIN_NAME = "testDomain";
  private static final String MODEL_ID = "visibleModelId";
  // private static final String CTX = "testContext";
  private static final String MATCH = "match";

  private MetadataService2 metadataService;

  private IMetadataDomainRepository mockDomainRepo;
  private LogicalModel visibleModel;
  private Domain validDomain;
  private MetadataServiceUtil2 util2;
  private QueryXmlHelper helper;

  @Before
  public void setUp() throws Exception {
    metadataService = spy( new MetadataService2() );

    mockDomainRepo = mock( IMetadataDomainRepository.class );

    visibleModel = mock( LogicalModel.class );
    // doReturn( "testCtx0," + CTX ).when( visibleModel ).getProperty( "visible" );
    doReturn( MODEL_ID ).when( visibleModel ).getId();
    doReturn( "visibleModelName" ).when( visibleModel ).getName( DEFAULT_LOCALE );
    doReturn( new LocalizedString() ).when( visibleModel ).getDescription();
    doReturn( "visibleModelDescLocale" ).when( visibleModel ).getDescription( DEFAULT_LOCALE );

    LogicalModel invisibleModel = mock( LogicalModel.class );
    doReturn( "testCtx0,testCtx1" ).when( invisibleModel ).getProperty( "visible" );

    List<LogicalModel> listModels = new ArrayList<LogicalModel>( 2 );
    listModels.add( visibleModel );
    listModels.add( invisibleModel );

    validDomain = mock( Domain.class );
    doReturn( listModels ).when( validDomain ).getLogicalModels();
    doReturn( DEFAULT_LOCALES_CODES ).when( validDomain ).getLocaleCodes();
    doReturn( visibleModel ).when( validDomain ).findLogicalModel( MODEL_ID );
    doReturn( validDomain ).when( mockDomainRepo ).getDomain( DOMAIN_NAME );
    Set<String> domainIds = new HashSet<String>();
    domainIds.add( DOMAIN_NAME );
    doReturn( domainIds ).when( mockDomainRepo ).getDomainIds();
    doReturn( mockDomainRepo ).when( metadataService ).getMetadataRepository();

    util2 = mock( MetadataServiceUtil2.class );
    doReturn( util2 ).when( metadataService ).getMetadataServiceUtil2();

    helper = mock( QueryXmlHelper.class );
    doReturn( helper ).when( metadataService ).getHelper();
  }

  @Test
  public void testGetModelListWithoutDefaultProvider() throws Exception {
    ModelInfo[] result = metadataService.getModelList( "incorrecrProvider", StringUtils.EMPTY, MATCH );
    assertEquals( 0, result.length );
  }

  @Test
  public void testGetModelListWithoutRepository() throws Exception {
    doReturn( null ).when( metadataService ).getMetadataRepository();
    ModelInfo[] result = metadataService.getModelList( MetadataService2.PROVIDER_ID, StringUtils.EMPTY, MATCH );
    assertNull( result );
  }

  @Test
  public void testListBusinessModelsWithoutDomainName() throws Exception {
    ModelInfo[] result = metadataService.getModelList( MetadataService2.PROVIDER_ID, StringUtils.EMPTY, MATCH );
    assertNotNull( result );
    assertEquals( 1, result.length );
    assertEquals( DOMAIN_NAME, result[0].getGroupId() );
    assertEquals( visibleModel.getId(), result[0].getModelId() );
    assertEquals( visibleModel.getName( DEFAULT_LOCALE ), result[0].getName() );
    assertEquals( visibleModel.getDescription( DEFAULT_LOCALE ), result[0].getDescription() );
  }

  @Test
  public void testListBusinessModels() throws Exception {
    ModelInfo[] result = metadataService.getModelList( MetadataService2.PROVIDER_ID, DOMAIN_NAME, MATCH );
    assertNotNull( result );
    assertEquals( 1, result.length );
    assertEquals( DOMAIN_NAME, result[0].getGroupId() );
    assertEquals( visibleModel.getId(), result[0].getModelId() );
    assertEquals( visibleModel.getName( DEFAULT_LOCALE ), result[0].getName() );
    assertEquals( visibleModel.getDescription( DEFAULT_LOCALE ), result[0].getDescription() );
  }

  @Test
  public void testGetModel() {
    Model model = metadataService.getModel( PROVIDER_ID );
    assertNull( model );

    model = metadataService.getModel( PROVIDER_ID + "~" + DOMAIN_NAME );
    assertNull( model );

    model = metadataService.getModel( PROVIDER_ID + "~invalid_domain~invalid_model" );
    assertNull( model );

    model = metadataService.getModel( PROVIDER_ID + "~" + DOMAIN_NAME + "~invalid_model" );
    assertNull( model );

    Model mockModel = mock( Model.class );
    doReturn( mockModel ).when( util2 ).createThinModel( visibleModel, DOMAIN_NAME );
    model = metadataService.getModel( PROVIDER_ID + "~" + DOMAIN_NAME + "~" + MODEL_ID );
    assertEquals( mockModel, model );
  }

  @Test
  public void testExecuteQuery() {
    Query query = mock( Query.class );
    DataTable result = metadataService.executeQuery( query, 10 );
    assertNull( result );
  }

  @Test
  public void testDoQuery() {
    Integer rowLimit = new Integer( 10 );
    String xml = "xml";
    String sourceId = "sourceId";
    Query query = mock( Query.class );
    doReturn( sourceId ).when( query ).getSourceId();
    MarshallableResultSet mockRS = mock( MarshallableResultSet.class );
    org.pentaho.metadata.query.model.Query mockQuery = mock( org.pentaho.metadata.query.model.Query.class );
    Model model = mock( Model.class );
    doReturn( mockQuery ).when( util2 ).convertQuery( query, model );
    doReturn( xml ).when( helper ).toXML( mockQuery );
    doReturn( model ).when( metadataService ).getModel( sourceId );
    doReturn( mockRS ).when( metadataService ).doXmlQuery( xml, rowLimit );

    MarshallableResultSet result = metadataService.doQuery( query, rowLimit );
    assertEquals( mockRS, result );
  }

  @Test
  public void testDoXmlQuery() {
    Integer rowLimit = new Integer( 10 );
    String xml = "xml";

    doReturn( null ).when( metadataService ).executeQuery( xml, rowLimit );
    MarshallableResultSet result = metadataService.doXmlQuery( xml, rowLimit );
    assertNull( result );

    IPentahoMetaData mockedMetadata = mock( IPentahoMetaData.class );
    doReturn( new Object[][] { { "tt" } } ).when( mockedMetadata ).getColumnHeaders();
    IPentahoResultSet mockedResult = mock( IPentahoResultSet.class );
    doReturn( 1 ).when( mockedResult ).getColumnCount();
    doReturn( 1 ).when( mockedResult ).getRowCount();
    doReturn( null ).when( mockedResult ).next();
    doReturn( mockedMetadata ).when( mockedResult ).getMetaData();

    doReturn( mockedResult ).when( metadataService ).executeQuery( xml, rowLimit );
    result = metadataService.doXmlQuery( xml, rowLimit );
    assertNotNull( result );
    assertEquals( 0, result.getNumColumnHeaderSets() );
    assertEquals( 0, result.getNumRowHeaderSets() );
    assertEquals( "tt", result.getColumnNames().getColumnName()[0] );
  }

  @Test
  public void testDoXmlQueryToJson() {
    Integer rowLimit = new Integer( 10 );
    String xml = "xml";

    doReturn( null ).when( metadataService ).doXmlQuery( xml, rowLimit );
    String result = metadataService.doXmlQueryToJson( xml, rowLimit );
    assertNull( result );

    MarshallableResultSet resultSet = new MarshallableResultSet();
    resultSet.setNumColumnHeaderSets( 2 );
    resultSet.setNumRowHeaderSets( 1 );
    doReturn( resultSet ).when( metadataService ).doXmlQuery( xml, rowLimit );
    result = metadataService.doXmlQueryToJson( xml, rowLimit );
    assertNotNull( result );
  }

  @Test
  public void testDoXmlQueryToCdaJson() throws Exception {
    Integer rowLimit = new Integer( 10 );
    String xml = "xml";
    String json = "json";

    doReturn( null ).when( metadataService ).executeQuery( xml, rowLimit );
    String result = metadataService.doXmlQueryToCdaJson( xml, rowLimit );
    assertNull( result );

    IPentahoResultSet mockedResult = mock( IPentahoResultSet.class );
    doReturn( mockedResult ).when( metadataService ).executeQuery( xml, rowLimit );
    doReturn( validDomain ).when( util2 ).getDomainObject( xml );
    doReturn( json ).when( util2 ).createCdaJson( mockedResult, DEFAULT_LOCALE );
    result = metadataService.doXmlQueryToCdaJson( xml, rowLimit );
    assertEquals( json, result );
  }

  @Test
  public void testDoJsonQuery() {
    Integer rowLimit = new Integer( 10 );
    String json = "json";
    String query = "query";

    MarshallableResultSet rs = mock( MarshallableResultSet.class );
    doReturn( query ).when( metadataService ).getQueryXmlFromJson( json );
    doReturn( rs ).when( metadataService ).doXmlQuery( query, rowLimit );
    MarshallableResultSet result = metadataService.doJsonQuery( json, rowLimit );
    assertEquals( rs, result );
  }

  @Test
  public void testDoJsonQueryToJson() {
    Integer rowLimit = new Integer( 10 );
    String json = "json";
    String query = "query";
    String rs = "result";

    doReturn( query ).when( metadataService ).getQueryXmlFromJson( json );
    doReturn( rs ).when( metadataService ).doXmlQueryToJson( query, rowLimit );
    String result = metadataService.doJsonQueryToJson( json, rowLimit );
    assertEquals( rs, result );
  }

  @Test
  public void testDoJsonQueryToCdaJson() {
    Integer rowLimit = new Integer( 10 );
    String json = "json";
    String query = "query";
    String rs = "result";

    doReturn( query ).when( metadataService ).getQueryXmlFromJson( json );
    doReturn( rs ).when( metadataService ).doXmlQueryToCdaJson( query, rowLimit );
    String result = metadataService.doJsonQueryToCdaJson( json, rowLimit );
    assertEquals( rs, result );
  }

  @Test
  public void testGetQueryXmlFromJson() {
    String json = "json";
    String resultXml = "result";
    String sourceId = "sourceId";

    Query query = mock( Query.class );
    doReturn( sourceId ).when( query ).getSourceId();
    Model model = mock( Model.class );
    org.pentaho.metadata.query.model.Query modelQuery = mock( org.pentaho.metadata.query.model.Query.class );
    doReturn( query ).when( util2 ).deserializeJsonQuery( json );
    doReturn( modelQuery ).when( util2 ).convertQuery( query, model );
    doReturn( resultXml ).when( helper ).toXML( modelQuery );
    doReturn( model ).when( metadataService ).getModel( sourceId );

    String result = metadataService.getQueryXmlFromJson( json );
    assertEquals( resultXml, result );
  }
}
