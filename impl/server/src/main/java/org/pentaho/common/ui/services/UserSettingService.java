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


package org.pentaho.common.ui.services;

import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.pentaho.platform.api.usersettings.IUserSettingService;
import org.pentaho.platform.api.usersettings.pojo.IUserSetting;
import org.pentaho.platform.engine.core.system.PentahoBase;
import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.common.ui.messages.Messages;

import flexjson.JSONSerializer;

/**
 * A service for reading and writing user settings. This class can be used to provide SOAP and JSON services for thin
 * clients.
 * 
 * @author jamesdixon
 * 
 */
public class UserSettingService extends PentahoBase {

  /**
   * 
   */
  private static final long serialVersionUID = 1372909204550846766L;

  public static final String THEME_KEY = "common-ui-user-theme"; //$NON-NLS-1$

  /**
   * Sets a user setting and returns a status message.
   * 
   * @param settingName
   * @param settingValue
   * @return
   */
  public StatusMessage setUserSetting( String settingName, String settingValue ) {
    JsonUtil utils = new JsonUtil();
    try {
      IUserSettingService settingsService =
          PentahoSystem.get( IUserSettingService.class, PentahoSessionHolder.getSession() );
      settingsService.setUserSetting( settingName, settingValue );
      return utils.createMessage( "SUCCESS", "0" ); //$NON-NLS-1$ //$NON-NLS-2$
    } catch ( Exception e ) {
      return utils
          .createMessage(
              Messages.getString( "UserSettingService.ERROR_0003_SETTINGS_WRITE", settingName ), "InteractiveAdhocService.ERROR_0003_SETTINGS_WRITE" ); //$NON-NLS-1$ //$NON-NLS-2$
    }
  }

  /**
   * Sets a user setting and returns a JSON status message.
   * 
   * @param settingName
   * @param settingValue
   * @return
   */
  public String setUserSettingJson( String settingName, String settingValue ) {

    StatusMessage msg = setUserSetting( settingName, settingValue );
    return new JSONSerializer().deepSerialize( msg );

  }

  /**
   * Given a comma separated list of setting names, return their values
   * 
   * @param settingNames
   * @return
   */
  public Setting[] getUserSettings( String settingNames ) throws Exception {
    StringTokenizer tokenizer = new StringTokenizer( settingNames, "," ); //$NON-NLS-1$
    IUserSettingService settingsService =
        PentahoSystem.get( IUserSettingService.class, PentahoSessionHolder.getSession() );
    String settingName, value;
    IUserSetting srcSetting;
    List<Setting> settings = new ArrayList<Setting>();
    while ( tokenizer.hasMoreTokens() ) {
      settingName = tokenizer.nextToken();
      srcSetting = settingsService.getUserSetting( settingName, null );
      if ( srcSetting != null ) {
        value = srcSetting.getSettingValue();
        // create a new setting object
        Setting setting = new Setting();
        setting.setName( settingName );
        setting.setValue( value );
        settings.add( setting );
      }
    }
    Setting[] settingArray = new Setting[settings.size()];
    settings.toArray( settingArray );
    return settingArray;
  }

  /**
   * Given a comma separated list of setting names, return their a JSON object with the values
   * 
   * @param settingNames
   * @return
   */
  public String getUserSettingsJson( String settingNames ) {
    JsonUtil utils = new JsonUtil();
    try {
      Setting[] settingArray = getUserSettings( settingNames );
      JSONSerializer serializer = new JSONSerializer();
      String json = serializer.deepSerialize( settingArray );
      return json;
    } catch ( Exception e ) {
      error( Messages.getErrorString( "UserSettingService.ERROR_0002_SETTINGS_READ", e.getLocalizedMessage() ), e ); //$NON-NLS-1$
      return utils.createJsonMessage( Messages.getString(
          "UserSettingService.ERROR_0002_SETTINGS_READ", e.getLocalizedMessage() ), "ERROR_0002_SETTINGS_READ" ); //$NON-NLS-1$ //$NON-NLS-2$
    }
  }

  @Override
  public Log getLogger() {
    return LogFactory.getLog( UserSettingService.class );
  }
}
